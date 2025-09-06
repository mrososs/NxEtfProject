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
  let apiEndpoint =
    'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/CourseTracker';
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

    // Create and expose SCORM API immediately for Rise 360 courses
    createMockScormAPI();

    // Try to find existing SCORM API
    findScormAPI();

    // Initialize SCORM API if found
    if (scormAPI && scormAPI.LMSInitialize) {
      try {
        const result = scormAPI.LMSInitialize('');
        console.log('SCORM API initialized:', result);
      } catch (error) {
        console.error('Error initializing SCORM API:', error);
      }
    }

    // Send ready message to parent
    sendMessageToParent({
      type: 'scorm_ready',
      data: {
        scormVersion: getScormVersion(),
        apiFound: !!scormAPI,
        initialized: true,
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
        apiEndpoint =
          message.apiEndpoint ||
          'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/CourseTracker';
        isInitialized = true;

        console.log('SCORM initialized with course ID:', courseId);
        console.log('API Endpoint:', apiEndpoint);

        // Send initial status
        trackElement('lesson_status', 'not_attempted');
      } else if (message.type === 'load_scorm_wrapper') {
        // Parent is asking us to load the SCORM wrapper script
        console.log('Parent requested SCORM wrapper load:', message.scriptUrl);
        loadScormWrapperScript(message.scriptUrl);
      }
    } catch (error) {
      console.error('Error handling parent message:', error);
    }
  }

  /**
   * Load SCORM wrapper script dynamically
   */
  function loadScormWrapperScript(scriptUrl) {
    try {
      // Check if script is already loaded
      if (window.ScormWrapper) {
        console.log('SCORM wrapper already loaded');
        return;
      }

      const script = document.createElement('script');
      script.src = scriptUrl;
      script.onload = () => {
        console.log('SCORM wrapper script loaded successfully');
        // Re-initialize after script loads
        setTimeout(initializeScormWrapper, 500);
      };
      script.onerror = () => {
        console.error('Failed to load SCORM wrapper script');
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading SCORM wrapper script:', error);
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

    // Expose SCORM API globally for Rise 360 courses
    window.API = scormAPI;
    window.API_1484_11 = scormAPI;

    console.log(
      'SCORM API exposed globally as window.API and window.API_1484_11'
    );
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
    console.log('=== TRACK ELEMENT CALLED ===');
    console.log('Element:', element);
    console.log('Value:', value);
    console.log('Initialized:', isInitialized);
    console.log('Course ID:', courseId);
    console.log('=============================');

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
      case 'lesson_status':
        handleLessonStatus(value);
        break;
      case 'cmi.core.lesson_location':
      case 'lesson_location':
        handleLessonLocation(value);
        break;
      case 'cmi.core.score.raw':
      case 'cmi.core.score.max':
      case 'cmi.core.score.min':
      case 'score':
        handleScore(value);
        break;
      case 'cmi.core.total_time':
      case 'cmi.core.session_time':
      case 'total_time':
        handleTotalTime(value);
        break;
      case 'cmi.suspend_data':
      case 'suspend_data':
        handleSuspendData(value);
        break;
      case 'cmi.core.exit':
      case 'cmi.core.entry':
        handleEntryExit(element, value);
        break;
      case 'cmi.core.student_id':
      case 'cmi.core.student_name':
        handleStudentInfo(element, value);
        break;
      default:
        // Handle custom elements or unknown elements
        handleCustomElement(element, value);
        break;
    }
  }

  /**
   * Handle lesson status changes
   */
  function handleLessonStatus(status) {
    console.log('Lesson status changed to:', status);

    // Map status to progress percentage for Rise 360 courses
    let progressPercentage = 0;
    switch (status) {
      case 'not_attempted':
        progressPercentage = 0;
        break;
      case 'incomplete':
        progressPercentage = 25;
        break;
      case 'browsed':
        progressPercentage = 50;
        break;
      case 'completed':
      case 'passed':
        progressPercentage = 100;
        break;
      case 'failed':
        progressPercentage = 0;
        break;
      default:
        progressPercentage = 0;
    }

    // Update progress
    updateProgress(progressPercentage);

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

    // Try to parse suspend data for progress information
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.progress !== undefined) {
        updateProgress(parsedData.progress);
      }
      // Handle Rise 360 specific suspend data
      if (parsedData.lessonProgress !== undefined) {
        updateProgress(parsedData.lessonProgress);
      }
      if (parsedData.completionPercentage !== undefined) {
        updateProgress(parsedData.completionPercentage);
      }
    } catch (e) {
      // If not JSON, treat as simple progress value
      const progressMatch = data.match(/(\d+)%/);
      if (progressMatch) {
        updateProgress(parseInt(progressMatch[1]));
      }

      // Handle Rise 360 specific patterns
      const riseProgressMatch = data.match(/progress[=:](\d+)/i);
      if (riseProgressMatch) {
        updateProgress(parseInt(riseProgressMatch[1]));
      }

      const completionMatch = data.match(/completion[=:](\d+)/i);
      if (completionMatch) {
        updateProgress(parseInt(completionMatch[1]));
      }
    }
  }

  /**
   * Handle entry/exit values
   */
  function handleEntryExit(element, value) {
    console.log('Entry/Exit changed:', element, '=', value);

    if (element === 'cmi.core.exit' && value === 'logout') {
      // Course is being exited, send final status
      sendMessageToParent({
        type: 'scorm_exit',
        courseId: courseId,
        data: {
          exitType: value,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Handle student information
   */
  function handleStudentInfo(element, value) {
    console.log('Student info changed:', element, '=', value);

    sendMessageToParent({
      type: 'scorm_student_info',
      courseId: courseId,
      data: {
        element: element,
        value: value,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Handle custom elements
   */
  function handleCustomElement(element, value) {
    console.log('Custom element changed:', element, '=', value);

    // Check if it's a progress-related custom element
    if (
      element.toLowerCase().includes('progress') ||
      element.toLowerCase().includes('completion') ||
      element.toLowerCase().includes('percentage')
    ) {
      const progressValue = parseInt(value);
      if (!isNaN(progressValue) && progressValue >= 0 && progressValue <= 100) {
        updateProgress(progressValue);
      }
    }

    // Send custom element data to parent
    sendMessageToParent({
      type: 'scorm_custom_element',
      courseId: courseId,
      data: {
        element: element,
        value: value,
        timestamp: new Date().toISOString(),
      },
    });
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

    // Send progress data directly to CourseTracker API
    const progressData = {
      element: 'progress',
      courseId: courseId,
      value: percentage.toString(),
    };

    console.log('Sending progress data to CourseTracker:', progressData);

    // Send to CourseTracker API
    sendToCourseTrackerAPI('progress', percentage.toString());

    // Send progress update to parent
    sendMessageToParent({
      type: 'scorm_progress',
      courseId: courseId,
      data: {
        percentage: percentage,
        timestamp: new Date().toISOString(),
      },
    });

    // Check if course is completed (100%)
    if (percentage >= 100) {
      console.log('Course completed! Sending completion notification...');

      // Send completion notification
      sendMessageToParent({
        type: 'scorm_complete',
        courseId: courseId,
        data: {
          status: 'completed',
          percentage: 100,
          timestamp: new Date().toISOString(),
          certificateAvailable: true,
        },
      });

      // Update lesson status to completed
      if (scormAPI && scormAPI.LMSSetValue) {
        try {
          scormAPI.LMSSetValue('cmi.core.lesson_status', 'completed');
          scormAPI.LMSCommit('');
        } catch (error) {
          console.error('Error setting lesson status to completed:', error);
        }
      }
    }
  }

  /**
   * Send message to parent window
   */
  function sendMessageToParent(message) {
    console.log('=== SENDING MESSAGE TO PARENT ===');
    console.log('Message:', message);
    console.log(
      'Window parent exists:',
      !!(window.parent && window.parent !== window)
    );
    console.log('==================================');

    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
        console.log('Message sent successfully to parent');
      } else {
        console.warn('No parent window available to send message');
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

    // Use GET method with query parameters
    const getUrl = `${apiEndpoint}?element=${encodeURIComponent(
      element
    )}&courseId=${courseId}&value=${encodeURIComponent(value)}`;

    console.log('=== SENDING TO COURSE TRACKER API (GET) ===');
    console.log('Element:', element);
    console.log('Course ID:', courseId);
    console.log('Value:', value);
    console.log('GET URL:', getUrl);
    console.log('==========================================');

    fetch(getUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        console.log('CourseTracker API response status:', response.status);
        console.log('CourseTracker API response headers:', response.headers);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      })
      .then((data) => {
        console.log('CourseTracker API response data:', data);
      })
      .catch((error) => {
        console.error('Error sending to CourseTracker API:', error);
        console.error('GET URL that failed:', getUrl);
        console.error('API endpoint that failed:', apiEndpoint);
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

  // Initialize immediately for Rise 360 courses
  initializeScormWrapper();

  // Also initialize when DOM is ready as backup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      console.log('DOM loaded, re-initializing SCORM wrapper...');
      initializeScormWrapper();
    });
  }

  // Initialize when window loads (for iframe scenarios)
  window.addEventListener('load', function () {
    console.log('Window loaded, initializing SCORM wrapper...');
    initializeScormWrapper();
  });

  // Override SCORM methods after a short delay
  setTimeout(overrideScormMethods, 1000);

  // Handle page unload
  window.addEventListener('beforeunload', handlePageUnload);

  // Add Rise 360 specific event listeners
  window.addEventListener('load', function () {
    console.log('Window loaded, checking for Rise 360 LMSProxy...');

    // Check if Rise 360 LMSProxy exists and try to connect
    if (window.LMSProxy) {
      console.log('Rise 360 LMSProxy found, attempting to connect...');
      try {
        if (window.LMSProxy.initialize) {
          window.LMSProxy.initialize();
        }
      } catch (error) {
        console.error('Error initializing Rise 360 LMSProxy:', error);
      }
    }
  });

  // Export functions for external use
  window.ScormWrapper = {
    trackElement: trackElement,
    updateProgress: updateProgress,
    sendMessageToParent: sendMessageToParent,
  };
})();
