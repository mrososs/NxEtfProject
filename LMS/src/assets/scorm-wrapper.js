/**
 * SCORM Wrapper for CourseTracker Integration
 * This script should be included in SCORM courses to enable communication with the parent window
 * and send tracking data to the CourseTracker API.
 */

(function () {
  'use strict';

  // SCORM API variables
  let scormAPI = null;
  let courseId = null;
  let apiEndpoint = '/api/CourseTracker';
  let isInitialized = false;

  // Progress tracking variables
  let lastProgressUpdate = 0;
  const PROGRESS_UPDATE_INTERVAL = 5000; // 5 seconds

  /**
   * Initialize SCORM wrapper
   */
  function initializeScormWrapper() {
    console.log('Initializing SCORM wrapper...');

    // Listen for messages from parent window
    window.addEventListener('message', handleParentMessage);

    // Try to find SCORM API
    findScormAPI();

    // Send ready message to parent
    sendMessageToParent({
      type: 'scorm_ready',
      data: {
        scormVersion: getScormVersion(),
        apiFound: !!scormAPI,
      },
    });

    console.log('SCORM wrapper initialized');
  }

  /**
   * Handle messages from parent window
   */
  function handleParentMessage(event) {
    try {
      const message = event.data;
      console.log('Received message from parent:', message);

      if (message.type === 'scorm_init') {
        courseId = message.courseId;
        apiEndpoint = message.apiEndpoint || '/api/CourseTracker';
        isInitialized = true;

        console.log('SCORM initialized with course ID:', courseId);

        // Send initial status
        trackElement('lesson_status', 'not_attempted');
      }
    } catch (error) {
      console.error('Error handling parent message:', error);
    }
  }

  /**
   * Find SCORM API in the window
   */
  function findScormAPI() {
    // Try to find SCORM API in various locations
    const possibleAPIs = [
      window.API,
      window.API_1484_11,
      window.ScormAPI12,
      window.ScormAPI2004,
    ];

    for (const api of possibleAPIs) {
      if (api && typeof api === 'object') {
        scormAPI = api;
        console.log('SCORM API found:', api);
        break;
      }
    }

    if (!scormAPI) {
      console.warn('SCORM API not found, using mock implementation');
      createMockScormAPI();
    }
  }

  /**
   * Create mock SCORM API for testing
   */
  function createMockScormAPI() {
    scormAPI = {
      LMSInitialize: function () {
        console.log('Mock LMSInitialize called');
        return 'true';
      },
      LMSFinish: function () {
        console.log('Mock LMSFinish called');
        return 'true';
      },
      LMSGetValue: function (element) {
        console.log('Mock LMSGetValue called for:', element);
        return '';
      },
      LMSSetValue: function (element, value) {
        console.log('Mock LMSSetValue called:', element, '=', value);
        trackElement(element, value);
        return 'true';
      },
      LMSCommit: function () {
        console.log('Mock LMSCommit called');
        return 'true';
      },
      LMSGetLastError: function () {
        return '0';
      },
      LMSGetErrorString: function (errorCode) {
        return 'No error';
      },
      LMSGetDiagnostic: function (errorCode) {
        return 'No diagnostic information';
      },
    };
  }

  /**
   * Get SCORM version
   */
  function getScormVersion() {
    if (window.API) return '1.2';
    if (window.API_1484_11) return '2004';
    return 'unknown';
  }

  /**
   * Track SCORM element
   */
  function trackElement(element, value) {
    if (!isInitialized || !courseId) {
      console.warn('SCORM not initialized, cannot track element:', element);
      return;
    }

    console.log('Tracking element:', element, '=', value);

    // Send tracking data to parent window
    sendMessageToParent({
      type: 'scorm_tracking',
      courseId: courseId,
      element: element,
      value: value,
    });

    // Send to CourseTracker API directly
    sendToCourseTrackerAPI(element, value);

    // Handle special elements
    handleSpecialElement(element, value);
  }

  /**
   * Handle special SCORM elements
   */
  function handleSpecialElement(element, value) {
    switch (element) {
      case 'cmi.core.lesson_status':
      case 'cmi.completion_status':
        handleLessonStatus(value);
        break;
      case 'cmi.core.lesson_location':
        handleLessonLocation(value);
        break;
      case 'cmi.core.score.raw':
        handleScore(value);
        break;
      case 'cmi.core.total_time':
        handleTotalTime(value);
        break;
      case 'cmi.suspend_data':
        handleSuspendData(value);
        break;
    }
  }

  /**
   * Handle lesson status changes
   */
  function handleLessonStatus(status) {
    console.log('Lesson status changed to:', status);

    if (status === 'completed' || status === 'passed') {
      sendMessageToParent({
        type: 'scorm_complete',
        courseId: courseId,
        data: {
          status: status,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Handle lesson location changes
   */
  function handleLessonLocation(location) {
    console.log('Lesson location changed to:', location);

    // Send checkpoint data
    sendMessageToParent({
      type: 'scorm_checkpoint',
      courseId: courseId,
      data: {
        location: location,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Handle score changes
   */
  function handleScore(score) {
    console.log('Score changed to:', score);

    // Calculate completion percentage based on score
    const scoreNum = parseInt(score) || 0;
    const percentage = Math.min(100, Math.max(0, scoreNum));

    updateProgress(percentage);
  }

  /**
   * Handle total time changes
   */
  function handleTotalTime(time) {
    console.log('Total time changed to:', time);
  }

  /**
   * Handle suspend data changes
   */
  function handleSuspendData(data) {
    console.log('Suspend data changed to:', data);
  }

  /**
   * Update progress percentage
   */
  function updateProgress(percentage) {
    const now = Date.now();

    // Throttle progress updates
    if (now - lastProgressUpdate < PROGRESS_UPDATE_INTERVAL) {
      return;
    }

    lastProgressUpdate = now;

    console.log('Updating progress to:', percentage + '%');

    // Track completion percentage
    trackElement('completion_percentage', percentage.toString());

    // Send progress update to parent
    sendMessageToParent({
      type: 'scorm_progress',
      courseId: courseId,
      data: {
        percentage: percentage,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send message to parent window
   */
  function sendMessageToParent(message) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
      }
    } catch (error) {
      console.error('Error sending message to parent:', error);
    }
  }

  /**
   * Send data directly to CourseTracker API
   */
  function sendToCourseTrackerAPI(element, value) {
    if (!courseId) return;

    const requestData = {
      element: element,
      courseId: courseId,
      value: value,
    };

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('CourseTracker API response:', data);
      })
      .catch((error) => {
        console.error('Error sending to CourseTracker API:', error);
      });
  }

  /**
   * Override SCORM API methods to add tracking
   */
  function overrideScormMethods() {
    if (!scormAPI) return;

    // Override LMSSetValue to add tracking
    const originalSetValue = scormAPI.LMSSetValue;
    scormAPI.LMSSetValue = function (element, value) {
      const result = originalSetValue.call(this, element, value);
      trackElement(element, value);
      return result;
    };

    console.log('SCORM methods overridden for tracking');
  }

  /**
   * Handle page unload
   */
  function handlePageUnload() {
    console.log('Page unloading, sending final status');

    if (scormAPI && scormAPI.LMSFinish) {
      scormAPI.LMSFinish('');
    }

    // Send final status to parent
    sendMessageToParent({
      type: 'scorm_unload',
      courseId: courseId,
      data: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScormWrapper);
  } else {
    initializeScormWrapper();
  }

  // Override SCORM methods after a short delay
  setTimeout(overrideScormMethods, 1000);

  // Handle page unload
  window.addEventListener('beforeunload', handlePageUnload);

  // Export functions for external use
  window.ScormWrapper = {
    trackElement: trackElement,
    updateProgress: updateProgress,
    sendMessageToParent: sendMessageToParent,
  };
})();
