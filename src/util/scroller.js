'use strict';
import Animate from './animate';
const NOOP = () => {};

/**
 * A pure logic 'component' for 'virtual' scrolling/zooming.
 */
const Scroller = function(callback, options) {
  this.__callback = callback;

  this.options = {
    /** Enable scrolling on x-axis */
    scrollingX: true,

    /** Enable scrolling on y-axis */
    scrollingY: true,

    /** Enable animations for deceleration, snap back, zooming and scrolling */
    animating: true,

    /** duration for animations triggered by scrollTo/zoomTo */
    animationDuration: 250,

    /** Enable bouncing (content can be slowly moved outside and jumps back after releasing) */
    bouncing: true,

    /** Enable locking to the main axis if user moves only slightly on one of them at start */
    locking: true,

    /** Enable pagination mode (switching between full page content panes) */
    paging: false,

    /** Enable snapping of content to a configured pixel grid */
    snapping: false,

    /** Enable zooming of content via API, fingers and mouse wheel */
    zooming: false,

    /** Minimum zoom level */
    minZoom: 0.5,

    /** Maximum zoom level */
    maxZoom: 3,

    /** Multiply or decrease scrolling speed **/
    speedMultiplier: 1,

    /** Callback that is fired on the later of touch end or deceleration end,
            provided that another scrolling action has not begun. Used to know
            when to fade out a scrollbar. */
    scrollingComplete: NOOP,

    /** This configures the amount of change applied to deceleration when reaching boundaries  **/
    penetrationDeceleration: 0.03,

    /** This configures the amount of change applied to acceleration when reaching boundaries  **/
    penetrationAcceleration: 0.08
  };

  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      this.options[key] = options[key];
    }
  }
};

// Easing Equations (c) 2003 Robert Penner, all rights reserved.
// Open source under the BSD License.

/**
 * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
 **/
const easeOutCubic = function(pos) {
  return Math.pow(pos - 1, 3) + 1;
};

/**
 * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
 **/
const easeInOutCubic = function(pos) {
  if ((pos /= 0.5) < 1) {
    return 0.5 * Math.pow(pos, 3);
  }

  return 0.5 * (Math.pow(pos - 2, 3) + 2);
};

const members = {
  /*
    ---------------------------------------------------------------------------
        INTERNAL FIELDS :: STATUS
    ---------------------------------------------------------------------------
    */

  /** {Boolean} Whether only a single finger is used in touch handling */
  __isSingleTouch: false,

  /** {Boolean} Whether a touch event sequence is in progress */
  __isTracking: false,

  /** {Boolean} Whether a deceleration animation went to completion. */
  __didDecelerationComplete: false,

  /**
   * {Boolean} Whether a gesture zoom/rotate event is in progress. Activates when
   * a gesturestart event happens. This has higher priority than dragging.
   */
  __isGesturing: false,

  /**
   * {Boolean} Whether the user has moved by such a distance that we have enabled
   * dragging mode. Hint: It's only enabled after some pixels of movement to
   * not interrupt with clicks etc.
   */
  __isDragging: false,

  /**
   * {Boolean} Not touching and dragging anymore, and smoothly animating the
   * touch sequence using deceleration.
   */
  __isDecelerating: false,

  /**
   * {Boolean} Smoothly animating the currently configured change
   */
  __isAnimating: false,

  /*
    ---------------------------------------------------------------------------
        INTERNAL FIELDS :: DIMENSIONS
    ---------------------------------------------------------------------------
    */

  /** {Integer} Available outer left position (from document perspective) */
  __clientLeft: 0,

  /** {Integer} Available outer top position (from document perspective) */
  __clientTop: 0,

  /** {Integer} Available outer width */
  __clientWidth: 0,

  /** {Integer} Available outer height */
  __clientHeight: 0,

  /** {Integer} Outer width of content */
  __contentWidth: 0,

  /** {Integer} Outer height of content */
  __contentHeight: 0,

  /** {Integer} Snapping width for content */
  __snapWidth: 100,

  /** {Integer} Snapping height for content */
  __snapHeight: 100,

  /** {Integer} Height to assign to refresh area */
  __refreshHeight: null,

  /** {Boolean} Whether the refresh process is enabled when the event is released now */
  __refreshActive: false,

  /** {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release */
  __refreshActivate: null,

  /** {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled */
  __refreshDeactivate: null,

  /** {Function} Callback to execute to start the actual refresh. Call {@link #refreshFinish} when done */
  __refreshStart: null,

  /** {Number} Zoom level */
  __zoomLevel: 1,

  /** {Number} Scroll position on x-axis */
  __scrollLeft: 0,

  /** {Number} Scroll position on y-axis */
  __scrollTop: 0,

  /** {Integer} Maximum allowed scroll position on x-axis */
  __maxScrollLeft: 0,

  /** {Integer} Maximum allowed scroll position on y-axis */
  __maxScrollTop: 0,

  /* {Number} Scheduled left position (final position when animating) */
  __scheduledLeft: 0,

  /* {Number} Scheduled top position (final position when animating) */
  __scheduledTop: 0,

  /* {Number} Scheduled zoom level (final scale when animating) */
  __scheduledZoom: 0,

  /*
    ---------------------------------------------------------------------------
        INTERNAL FIELDS :: LAST POSITIONS
    ---------------------------------------------------------------------------
    */

  /** {Number} Left position of finger at start */
  __lastTouchLeft: null,

  /** {Number} Top position of finger at start */
  __lastTouchTop: null,

  /** {Date} Timestamp of last move of finger. Used to limit tracking range for deceleration speed. */
  __lastTouchMove: null,

  /** {Array} List of positions, uses three indexes for each state: left, top, timestamp */
  __positions: null,

  /*
    ---------------------------------------------------------------------------
        INTERNAL FIELDS :: DECELERATION SUPPORT
    ---------------------------------------------------------------------------
    */

  /** {Integer} Minimum left scroll position during deceleration */
  __minDecelerationScrollLeft: null,

  /** {Integer} Minimum top scroll position during deceleration */
  __minDecelerationScrollTop: null,

  /** {Integer} Maximum left scroll position during deceleration */
  __maxDecelerationScrollLeft: null,

  /** {Integer} Maximum top scroll position during deceleration */
  __maxDecelerationScrollTop: null,

  /** {Number} Current factor to modify horizontal scroll position with on every step */
  __decelerationVelocityX: null,

  /** {Number} Current factor to modify vertical scroll position with on every step */
  __decelerationVelocityY: null,

  /*
    ---------------------------------------------------------------------------
        PUBLIC API
    ---------------------------------------------------------------------------
    */

  /**
   * Configures the dimensions of the client (outer) and content (inner) elements.
   * Requires the available space for the outer element and the outer size of the inner element.
   * All values which are falsy (null or zero etc.) are ignored and the old value is kept.
   *
   * @param clientWidth {Integer ? null} Inner width of outer element
   * @param clientHeight {Integer ? null} Inner height of outer element
   * @param contentWidth {Integer ? null} Outer width of inner element
   * @param contentHeight {Integer ? null} Outer height of inner element
   */
  setDimensions: function(clientWidth, clientHeight, contentWidth, contentHeight) {
    const me = this;

    // Only update values which are defined
    if (clientWidth === +clientWidth) {
      me.__clientWidth = clientWidth;
    }

    if (clientHeight === +clientHeight) {
      me.__clientHeight = clientHeight;
    }

    if (contentWidth === +contentWidth) {
      me.__contentWidth = contentWidth;
    }

    if (contentHeight === +contentHeight) {
      me.__contentHeight = contentHeight;
    }

    // Refresh maximums
    me.__computeScrollMax();

    // Refresh scroll position
    me.scrollTo(me.__scrollLeft, me.__scrollTop, true);
  },

  /**
   * Sets the client coordinates in relation to the document.
   *
   * @param left {Integer ? 0} Left position of outer element
   * @param top {Integer ? 0} Top position of outer element
   */
  setPosition: function(left, top) {
    const me = this;

    me.__clientLeft = left || 0;
    me.__clientTop = top || 0;
  },

  /**
   * Configures the snapping (when snapping is active)
   *
   * @param width {Integer} Snapping width
   * @param height {Integer} Snapping height
   */
  setSnapSize: function(width, height) {
    const me = this;

    me.__snapWidth = width;
    me.__snapHeight = height;
  },

  /**
   * Activates pull-to-refresh. A special zone on the top of the list to start a list refresh whenever
   * the user event is released during visibility of this zone. This was introduced by some apps on iOS like
   * the official Twitter client.
   *
   * @param height {Integer} Height of pull-to-refresh zone on top of rendered list
   * @param activateCallback {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release.
   * @param deactivateCallback {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled.
   * @param startCallback {Function} Callback to execute to start the real async refresh action. Call {@link #finishPullToRefresh} after finish of refresh.
   */
  activatePullToRefresh: function(height, activateCallback, deactivateCallback, startCallback) {
    const me = this;

    me.__refreshHeight = height;
    me.__refreshActivate = activateCallback;
    me.__refreshDeactivate = deactivateCallback;
    me.__refreshStart = startCallback;
  },

  /**
   * Starts pull-to-refresh manually.
   */
  triggerPullToRefresh: function() {
    // Use publish instead of scrollTo to allow scrolling to out of boundary position
    // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
    this.__publish(this.__scrollLeft, -this.__refreshHeight, this.__zoomLevel, true);

    if (this.__refreshStart) {
      this.__refreshStart();
    }
  },

  /**
   * Signalizes that pull-to-refresh is finished.
   */
  finishPullToRefresh: function() {
    const me = this;

    me.__refreshActive = false;
    if (me.__refreshDeactivate) {
      me.__refreshDeactivate();
    }

    me.scrollTo(me.__scrollLeft, me.__scrollTop, true);
  },

  /**
   * Returns the scroll position and zooming values
   *
   * @return {Map} `left` and `top` scroll position and `zoom` level
   */
  getValues: function() {
    const me = this;

    return {
      left: me.__scrollLeft,
      top: me.__scrollTop,
      zoom: me.__zoomLevel
    };
  },

  /**
   * Returns the maximum scroll values
   *
   * @return {Map} `left` and `top` maximum scroll values
   */
  getScrollMax: function() {
    const me = this;

    return {
      left: me.__maxScrollLeft,
      top: me.__maxScrollTop
    };
  },

  /**
   * Zooms to the given level. Supports optional animation. Zooms
   * the center when no coordinates are given.
   *
   * @param level {Number} Level to zoom to
   * @param animate {Boolean ? false} Whether to use animation
   * @param originLeft {Number ? null} Zoom in at given left coordinate
   * @param originTop {Number ? null} Zoom in at given top coordinate
   * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
   */
  zoomTo: function(level, animate, originLeft, originTop, callback) {
    const me = this;

    if (!me.options.zooming) {
      throw new Error('Zooming is not enabled!');
    }

    // Add callback if exists
    if (callback) {
      me.__zoomComplete = callback;
    }

    // Stop deceleration
    if (me.__isDecelerating) {
      Animate.stop(me.__isDecelerating);
      me.__isDecelerating = false;
    }

    const oldLevel = me.__zoomLevel;

    // Normalize input origin to center of viewport if not defined
    if (originLeft == null) {
      originLeft = me.__clientWidth / 2;
    }

    if (originTop == null) {
      originTop = me.__clientHeight / 2;
    }

    // Limit level according to configuration
    level = Math.max(Math.min(level, me.options.maxZoom), me.options.minZoom);

    // Recompute maximum values while temporary tweaking maximum scroll ranges
    me.__computeScrollMax(level);

    // Recompute left and top coordinates based on new zoom level
    let left = (originLeft + me.__scrollLeft) * level / oldLevel - originLeft;
    let top = (originTop + me.__scrollTop) * level / oldLevel - originTop;

    // Limit x-axis
    if (left > me.__maxScrollLeft) {
      left = me.__maxScrollLeft;
    } else if (left < 0) {
      left = 0;
    }

    // Limit y-axis
    if (top > me.__maxScrollTop) {
      top = me.__maxScrollTop;
    } else if (top < 0) {
      top = 0;
    }

    // Push values out
    me.__publish(left, top, level, animate);
  },

  /**
   * Zooms the content by the given factor.
   *
   * @param factor {Number} Zoom by given factor
   * @param animate {Boolean ? false} Whether to use animation
   * @param originLeft {Number ? 0} Zoom in at given left coordinate
   * @param originTop {Number ? 0} Zoom in at given top coordinate
   * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
   */
  zoomBy: function(factor, animate, originLeft, originTop, callback) {
    const me = this;

    me.zoomTo(me.__zoomLevel * factor, animate, originLeft, originTop, callback);
  },

  /**
   * Scrolls to the given position. Respect limitations and snapping automatically.
   *
   * @param left {Number?null} Horizontal scroll position, keeps current if value is <code>null</code>
   * @param top {Number?null} Vertical scroll position, keeps current if value is <code>null</code>
   * @param animate {Boolean?false} Whether the scrolling should happen using an animation
   * @param zoom {Number?null} Zoom level to go to
   */
  scrollTo: function(left, top, animate, zoom) {
    const me = this;

    // Stop deceleration
    if (me.__isDecelerating) {
      Animate.stop(me.__isDecelerating);
      me.__isDecelerating = false;
    }

    // Correct coordinates based on new zoom level
    if (zoom != null && zoom !== me.__zoomLevel) {
      if (!me.options.zooming) {
        throw new Error('Zooming is not enabled!');
      }

      left *= zoom;
      top *= zoom;

      // Recompute maximum values while temporary tweaking maximum scroll ranges
      me.__computeScrollMax(zoom);
    } else {
      // Keep zoom when not defined
      zoom = me.__zoomLevel;
    }

    if (!me.options.scrollingX) {
      left = me.__scrollLeft;
    } else if (me.options.paging) {
      left = Math.round(left / me.__clientWidth) * me.__clientWidth;
    } else if (me.options.snapping) {
      left = Math.round(left / me.__snapWidth) * me.__snapWidth;
    }

    if (!me.options.scrollingY) {
      top = me.__scrollTop;
    } else if (me.options.paging) {
      top = Math.round(top / me.__clientHeight) * me.__clientHeight;
    } else if (me.options.snapping) {
      top = Math.round(top / me.__snapHeight) * me.__snapHeight;
    }

    // Limit for allowed ranges
    left = Math.max(Math.min(me.__maxScrollLeft, left), 0);
    top = Math.max(Math.min(me.__maxScrollTop, top), 0);

    // Don't animate when no change detected, still call publish to make sure
    // that rendered position is really in-sync with internal data
    if (left === me.__scrollLeft && top === me.__scrollTop) {
      animate = false;
    }

    // Publish new values
    if (!me.__isTracking) {
      me.__publish(left, top, zoom, animate);
    }
  },

  /**
   * Scroll by the given offset
   *
   * @param left {Number ? 0} Scroll x-axis by given offset
   * @param top {Number ? 0} Scroll x-axis by given offset
   * @param animate {Boolean ? false} Whether to animate the given change
   */
  scrollBy: function(left, top, animate) {
    const me = this;

    const startLeft = me.__isAnimating ? me.__scheduledLeft : me.__scrollLeft;
    const startTop = me.__isAnimating ? me.__scheduledTop : me.__scrollTop;

    me.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);
  },

  /*
    ---------------------------------------------------------------------------
        EVENT CALLBACKS
    ---------------------------------------------------------------------------
    */

  /**
   * Mouse wheel handler for zooming support
   */
  doMouseZoom: function(wheelDelta, timeStamp, pageX, pageY) {
    const me = this;
    const change = wheelDelta > 0 ? 0.97 : 1.03;

    return me.zoomTo(me.__zoomLevel * change, false, pageX - me.__clientLeft, pageY - me.__clientTop);
  },

  /**
   * Touch start handler for scrolling support
   */
  doTouchStart: function(touches, timeStamp) {
    // Array-like check is enough here
    if (touches.length == null) {
      throw new Error(`Invalid touch list: ${touches}`);
    }

    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== 'number') {
      throw new Error(`Invalid timestamp value: ${timeStamp}`);
    }

    const me = this;

    // Reset interruptedAnimation flag
    me.__interruptedAnimation = true;

    // Stop deceleration
    if (me.__isDecelerating) {
      Animate.stop(me.__isDecelerating);
      me.__isDecelerating = false;
      me.__interruptedAnimation = true;
    }

    // Stop animation
    if (me.__isAnimating) {
      Animate.stop(me.__isAnimating);
      me.__isAnimating = false;
      me.__interruptedAnimation = true;
    }

    // Use center point when dealing with two fingers
    let currentTouchLeft;
    let currentTouchTop;
    const isSingleTouch = touches.length === 1;
    if (isSingleTouch) {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    } else {
      currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    }

    // Store initial positions
    me.__initialTouchLeft = currentTouchLeft;
    me.__initialTouchTop = currentTouchTop;

    // Store current zoom level
    me.__zoomLevelStart = me.__zoomLevel;

    // Store initial touch positions
    me.__lastTouchLeft = currentTouchLeft;
    me.__lastTouchTop = currentTouchTop;

    // Store initial move time stamp
    me.__lastTouchMove = timeStamp;

    // Reset initial scale
    me.__lastScale = 1;

    // Reset locking flags
    me.__enableScrollX = !isSingleTouch && me.options.scrollingX;
    me.__enableScrollY = !isSingleTouch && me.options.scrollingY;

    // Reset tracking flag
    me.__isTracking = true;

    // Reset deceleration complete flag
    me.__didDecelerationComplete = false;

    // Dragging starts directly with two fingers, otherwise lazy with an offset
    me.__isDragging = !isSingleTouch;

    // Some features are disabled in multi touch scenarios
    me.__isSingleTouch = isSingleTouch;

    // Clearing data structure
    me.__positions = [];
  },

  /**
   * Touch move handler for scrolling support
   */
  doTouchMove: function(touches, timeStamp, scale) {
    // Array-like check is enough here
    if (touches.length == null) {
      throw new Error(`Invalid touch list: ${touches}`);
    }

    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== 'number') {
      throw new Error(`Invalid timestamp value: ${timeStamp}`);
    }

    const me = this;

    // Ignore event when tracking is not enabled (event might be outside of element)
    if (!me.__isTracking) {
      return;
    }

    let currentTouchLeft;
    let currentTouchTop;

    // Compute move based around of center of fingers
    if (touches.length === 2) {
      currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    } else {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    }

    const positions = me.__positions;

    // Are we already is dragging mode?
    if (me.__isDragging) {
      // Compute move distance
      const moveX = currentTouchLeft - me.__lastTouchLeft;
      const moveY = currentTouchTop - me.__lastTouchTop;

      // Read previous scroll position and zooming
      let scrollLeft = me.__scrollLeft;
      let scrollTop = me.__scrollTop;
      let level = me.__zoomLevel;

      // Work with scaling
      if (scale != null && me.options.zooming) {
        const oldLevel = level;

        // Recompute level based on previous scale and new scale
        level = level / me.__lastScale * scale;

        // Limit level according to configuration
        level = Math.max(Math.min(level, me.options.maxZoom), me.options.minZoom);

        // Only do further compution when change happened
        if (oldLevel !== level) {
          // Compute relative event position to container
          const currentTouchLeftRel = currentTouchLeft - me.__clientLeft;
          const currentTouchTopRel = currentTouchTop - me.__clientTop;

          // Recompute left and top coordinates based on new zoom level
          scrollLeft = (currentTouchLeftRel + scrollLeft) * level / oldLevel - currentTouchLeftRel;
          scrollTop = (currentTouchTopRel + scrollTop) * level / oldLevel - currentTouchTopRel;

          // Recompute max scroll values
          me.__computeScrollMax(level);
        }
      }

      if (me.__enableScrollX) {
        scrollLeft -= moveX * this.options.speedMultiplier;
        const maxScrollLeft = me.__maxScrollLeft;

        if (scrollLeft > maxScrollLeft || scrollLeft < 0) {
          // Slow down on the edges
          if (me.options.bouncing) {
            scrollLeft += moveX / 2 * this.options.speedMultiplier;
          } else if (scrollLeft > maxScrollLeft) {
            scrollLeft = maxScrollLeft;
          } else {
            scrollLeft = 0;
          }
        }
      }

      // Compute new vertical scroll position
      if (me.__enableScrollY) {
        scrollTop -= moveY * this.options.speedMultiplier;
        const maxScrollTop = me.__maxScrollTop;

        if (scrollTop > maxScrollTop || scrollTop < 0) {
          // Slow down on the edges
          if (me.options.bouncing) {
            scrollTop += moveY / 2 * this.options.speedMultiplier;

            // Support pull-to-refresh (only when only y is scrollable)
            if (!me.__enableScrollX && me.__refreshHeight != null) {
              if (!me.__refreshActive && scrollTop <= -me.__refreshHeight) {
                me.__refreshActive = true;
                if (me.__refreshActivate) {
                  me.__refreshActivate();
                }
              } else if (me.__refreshActive && scrollTop > -me.__refreshHeight) {
                me.__refreshActive = false;
                if (me.__refreshDeactivate) {
                  me.__refreshDeactivate();
                }
              }
            }
          } else if (scrollTop > maxScrollTop) {
            scrollTop = maxScrollTop;
          } else {
            scrollTop = 0;
          }
        }
      }

      // Keep list from growing infinitely (holding min 10, max 20 measure points)
      if (positions.length > 60) {
        positions.splice(0, 30);
      }

      // Track scroll movement for decleration
      positions.push(scrollLeft, scrollTop, timeStamp);

      // Sync scroll position
      me.__publish(scrollLeft, scrollTop, level);

      // Otherwise figure out whether we are switching into dragging mode now.
    } else {
      const minimumTrackingForScroll = me.options.locking ? 3 : 0;
      const minimumTrackingForDrag = 5;

      const distanceX = Math.abs(currentTouchLeft - me.__initialTouchLeft);
      const distanceY = Math.abs(currentTouchTop - me.__initialTouchTop);

      me.__enableScrollX = me.options.scrollingX && distanceX >= minimumTrackingForScroll;
      me.__enableScrollY = me.options.scrollingY && distanceY >= minimumTrackingForScroll;

      positions.push(me.__scrollLeft, me.__scrollTop, timeStamp);

      me.__isDragging =
        (me.__enableScrollX || me.__enableScrollY) &&
        (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
      if (me.__isDragging) {
        me.__interruptedAnimation = false;
      }
    }

    // Update last touch positions and time stamp for next event
    me.__lastTouchLeft = currentTouchLeft;
    me.__lastTouchTop = currentTouchTop;
    me.__lastTouchMove = timeStamp;
    me.__lastScale = scale;
  },

  /**
   * Touch end handler for scrolling support
   */
  doTouchEnd: function(timeStamp) {
    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== 'number') {
      throw new Error(`Invalid timestamp value: ${timeStamp}`);
    }

    const me = this;

    // Ignore event when tracking is not enabled (no touchstart event on element)
    // This is required as this listener ('touchmove') sits on the document and not on the element itme.
    if (!me.__isTracking) {
      return;
    }

    // Not touching anymore (when two finger hit the screen there are two touch end events)
    me.__isTracking = false;

    // Be sure to reset the dragging flag now. Here we also detect whether
    // the finger has moved fast enough to switch into a deceleration animation.
    if (me.__isDragging) {
      // Reset dragging flag
      me.__isDragging = false;

      // Start deceleration
      // Verify that the last move detected was in some relevant time frame
      if (me.__isSingleTouch && me.options.animating && timeStamp - me.__lastTouchMove <= 100) {
        // Then figure out what the scroll position was about 100ms ago
        const positions = me.__positions;
        const endPos = positions.length - 1;
        let startPos = endPos;

        // Move pointer to position measured 100ms ago
        for (let i = endPos; i > 0 && positions[i] > me.__lastTouchMove - 100; i -= 3) {
          startPos = i;
        }

        // If start and stop position is identical in a 100ms timeframe,
        // we cannot compute any useful deceleration.
        if (startPos !== endPos) {
          // Compute relative movement between these two points
          const timeOffset = positions[endPos] - positions[startPos];
          const movedLeft = me.__scrollLeft - positions[startPos - 2];
          const movedTop = me.__scrollTop - positions[startPos - 1];

          // Based on 50ms compute the movement to apply for each render step
          me.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
          me.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60);

          // How much velocity is required to start the deceleration
          const minVelocityToStartDeceleration = me.options.paging || me.options.snapping ? 4 : 1;

          // Verify that we have enough velocity to start deceleration
          if (
            Math.abs(me.__decelerationVelocityX) > minVelocityToStartDeceleration ||
            Math.abs(me.__decelerationVelocityY) > minVelocityToStartDeceleration
          ) {
            // Deactivate pull-to-refresh when decelerating
            if (!me.__refreshActive) {
              me.__startDeceleration(timeStamp);
            }
          } else {
            me.options.scrollingComplete();
          }
        } else {
          me.options.scrollingComplete();
        }
      } else if (timeStamp - me.__lastTouchMove > 100) {
        me.options.scrollingComplete();
      }
    }

    // If this was a slower move it is per default non decelerated, but this
    // still means that we want snap back to the bounds which is done here.
    // This is placed outside the condition above to improve edge case stability
    // e.g. touchend fired without enabled dragging. This should normally do not
    // have modified the scroll positions or even showed the scrollbars though.
    if (!me.__isDecelerating) {
      if (me.__refreshActive && me.__refreshStart) {
        // Use publish instead of scrollTo to allow scrolling to out of boundary position
        // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
        me.__publish(me.__scrollLeft, -me.__refreshHeight, me.__zoomLevel, true);

        if (me.__refreshStart) {
          me.__refreshStart();
        }
      } else {
        if (me.__interruptedAnimation || me.__isDragging) {
          me.options.scrollingComplete();
        }
        me.scrollTo(me.__scrollLeft, me.__scrollTop, true, me.__zoomLevel);

        // Directly signalize deactivation (nothing todo on refresh?)
        if (me.__refreshActive) {
          me.__refreshActive = false;
          if (me.__refreshDeactivate) {
            me.__refreshDeactivate();
          }
        }
      }
    }

    // Fully cleanup list
    me.__positions.length = 0;
  },

  /*
    ---------------------------------------------------------------------------
        PRIVATE API
    ---------------------------------------------------------------------------
    */

  /**
   * Applies the scroll position to the content element
   *
   * @param left {Number} Left scroll position
   * @param top {Number} Top scroll position
   * @param animate {Boolean?false} Whether animation should be used to move to the new coordinates
   */
  __publish: function(left, top, zoom, animate) {
    const me = this;

    // Remember whether we had an animation, then we try to continue based on the current "drive" of the animation
    const wasAnimating = me.__isAnimating;
    if (wasAnimating) {
      Animate.stop(wasAnimating);
      me.__isAnimating = false;
    }

    if (animate && me.options.animating) {
      // Keep scheduled positions for scrollBy/zoomBy functionality
      me.__scheduledLeft = left;
      me.__scheduledTop = top;
      me.__scheduledZoom = zoom;

      const oldLeft = me.__scrollLeft;
      const oldTop = me.__scrollTop;
      const oldZoom = me.__zoomLevel;

      const diffLeft = left - oldLeft;
      const diffTop = top - oldTop;
      const diffZoom = zoom - oldZoom;

      const step = function(percent, now, render) {
        if (render) {
          me.__scrollLeft = oldLeft + diffLeft * percent;
          me.__scrollTop = oldTop + diffTop * percent;
          me.__zoomLevel = oldZoom + diffZoom * percent;

          // Push values out
          if (me.__callback) {
            me.__callback(me.__scrollLeft, me.__scrollTop, me.__zoomLevel);
          }
        }
      };

      const verify = function(id) {
        return me.__isAnimating === id;
      };

      const completed = function(renderedFramesPerSecond, animationId, wasFinished) {
        if (animationId === me.__isAnimating) {
          me.__isAnimating = false;
        }
        if (me.__didDecelerationComplete || wasFinished) {
          me.options.scrollingComplete();
        }

        if (me.options.zooming) {
          me.__computeScrollMax();
          if (me.__zoomComplete) {
            me.__zoomComplete();
            me.__zoomComplete = null;
          }
        }
      };

      // When continuing based on previous animation we choose an ease-out animation instead of ease-in-out
      me.__isAnimating = Animate.start(
        step,
        verify,
        completed,
        me.options.animationDuration,
        wasAnimating ? easeOutCubic : easeInOutCubic
      );
    } else {
      me.__scheduledLeft = me.__scrollLeft = left;
      me.__scheduledTop = me.__scrollTop = top;
      me.__scheduledZoom = me.__zoomLevel = zoom;

      // Push values out
      if (me.__callback) {
        me.__callback(left, top, zoom);
      }

      // Fix max scroll ranges
      if (me.options.zooming) {
        me.__computeScrollMax();
        if (me.__zoomComplete) {
          me.__zoomComplete();
          me.__zoomComplete = null;
        }
      }
    }
  },

  /**
   * Recomputes scroll minimum values based on client dimensions and content dimensions.
   */
  __computeScrollMax: function(zoomLevel) {
    const me = this;

    if (zoomLevel == null) {
      zoomLevel = me.__zoomLevel;
    }

    me.__maxScrollLeft = Math.max(me.__contentWidth * zoomLevel - me.__clientWidth, 0);
    me.__maxScrollTop = Math.max(me.__contentHeight * zoomLevel - me.__clientHeight, 0);
  },

  /*
    ---------------------------------------------------------------------------
        ANIMATION (DECELERATION) SUPPORT
    ---------------------------------------------------------------------------
    */

  /**
   * Called when a touch sequence end and the speed of the finger was high enough
   * to switch into deceleration mode.
   */
  __startDeceleration: function(timeStamp) {
    const me = this;

    if (me.options.paging) {
      const scrollLeft = Math.max(Math.min(me.__scrollLeft, me.__maxScrollLeft), 0);
      const scrollTop = Math.max(Math.min(me.__scrollTop, me.__maxScrollTop), 0);
      const clientWidth = me.__clientWidth;
      const clientHeight = me.__clientHeight;

      // We limit deceleration not to the min/max values of the allowed range, but to the size of the visible client area.
      // Each page should have exactly the size of the client area.
      me.__minDecelerationScrollLeft = Math.floor(scrollLeft / clientWidth) * clientWidth;
      me.__minDecelerationScrollTop = Math.floor(scrollTop / clientHeight) * clientHeight;
      me.__maxDecelerationScrollLeft = Math.ceil(scrollLeft / clientWidth) * clientWidth;
      me.__maxDecelerationScrollTop = Math.ceil(scrollTop / clientHeight) * clientHeight;
    } else {
      me.__minDecelerationScrollLeft = 0;
      me.__minDecelerationScrollTop = 0;
      me.__maxDecelerationScrollLeft = me.__maxScrollLeft;
      me.__maxDecelerationScrollTop = me.__maxScrollTop;
    }

    // Wrap class method
    const step = function(percent, now, render) {
      me.__stepThroughDeceleration(render);
    };

    // How much velocity is required to keep the deceleration running
    const minVelocityToKeepDecelerating = me.options.snapping ? 4 : 0.001;

    // Detect whether it's still worth to continue animating steps
    // If we are already slow enough to not being user perceivable anymore, we stop the whole process here.
    const verify = function() {
      const shouldContinue =
        Math.abs(me.__decelerationVelocityX) >= minVelocityToKeepDecelerating ||
        Math.abs(me.__decelerationVelocityY) >= minVelocityToKeepDecelerating;
      if (!shouldContinue) {
        me.__didDecelerationComplete = true;
      }
      return shouldContinue;
    };

    const completed = function(renderedFramesPerSecond, animationId, wasFinished) {
      me.__isDecelerating = false;
      if (me.__didDecelerationComplete) {
        me.options.scrollingComplete();
      }

      // Animate to grid when snapping is active, otherwise just fix out-of-boundary positions
      me.scrollTo(me.__scrollLeft, me.__scrollTop, me.options.snapping);
    };

    // Start animation and switch on flag
    me.__isDecelerating = Animate.start(step, verify, completed);
  },

  /**
   * Called on every step of the animation
   *
   * @param inMemory {Boolean?false} Whether to not render the current step, but keep it in memory only. Used internally only!
   */
  __stepThroughDeceleration: function(render) {
    const me = this;

    //
    // COMPUTE NEXT SCROLL POSITION
    //

    // Add deceleration to scroll position
    let scrollLeft = me.__scrollLeft + me.__decelerationVelocityX;
    let scrollTop = me.__scrollTop + me.__decelerationVelocityY;

    //
    // HARD LIMIT SCROLL POSITION FOR NON BOUNCING MODE
    //

    if (!me.options.bouncing) {
      const scrollLeftFixed = Math.max(
        Math.min(me.__maxDecelerationScrollLeft, scrollLeft),
        me.__minDecelerationScrollLeft
      );
      if (scrollLeftFixed !== scrollLeft) {
        scrollLeft = scrollLeftFixed;
        me.__decelerationVelocityX = 0;
      }

      const scrollTopFixed = Math.max(
        Math.min(me.__maxDecelerationScrollTop, scrollTop),
        me.__minDecelerationScrollTop
      );
      if (scrollTopFixed !== scrollTop) {
        scrollTop = scrollTopFixed;
        me.__decelerationVelocityY = 0;
      }
    }

    //
    // UPDATE SCROLL POSITION
    //

    if (render) {
      me.__publish(scrollLeft, scrollTop, me.__zoomLevel);
    } else {
      me.__scrollLeft = scrollLeft;
      me.__scrollTop = scrollTop;
    }

    //
    // SLOW DOWN
    //

    // Slow down velocity on every iteration
    if (!me.options.paging) {
      // This is the factor applied to every iteration of the animation
      // to slow down the process. This should emulate natural behavior where
      // objects slow down when the initiator of the movement is removed
      const frictionFactor = 0.95;

      me.__decelerationVelocityX *= frictionFactor;
      me.__decelerationVelocityY *= frictionFactor;
    }

    //
    // BOUNCING SUPPORT
    //

    if (me.options.bouncing) {
      let scrollOutsideX = 0;
      let scrollOutsideY = 0;

      // This configures the amount of change applied to deceleration/acceleration when reaching boundaries
      const { penetrationDeceleration, penetrationAcceleration } = me.options;

      // Check limits
      if (scrollLeft < me.__minDecelerationScrollLeft) {
        scrollOutsideX = me.__minDecelerationScrollLeft - scrollLeft;
      } else if (scrollLeft > me.__maxDecelerationScrollLeft) {
        scrollOutsideX = me.__maxDecelerationScrollLeft - scrollLeft;
      }

      if (scrollTop < me.__minDecelerationScrollTop) {
        scrollOutsideY = me.__minDecelerationScrollTop - scrollTop;
      } else if (scrollTop > me.__maxDecelerationScrollTop) {
        scrollOutsideY = me.__maxDecelerationScrollTop - scrollTop;
      }

      // Slow down until slow enough, then flip back to snap position
      if (scrollOutsideX !== 0) {
        if (scrollOutsideX * me.__decelerationVelocityX <= 0) {
          me.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
        } else {
          me.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
        }
      }

      if (scrollOutsideY !== 0) {
        if (scrollOutsideY * me.__decelerationVelocityY <= 0) {
          me.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
        } else {
          me.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
        }
      }
    }
  }
};

// Copy over members to prototype
for (const key in members) {
  if (Object.prototype.hasOwnProperty.call(members, key)) {
    Scroller.prototype[key] = members[key];
  }
}
export default Scroller;
