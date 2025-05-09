import { useState, useEffect, useCallback } from 'react';
import { DetectedObject } from '@/components/ui/results-display';

/**
 * Hook for text-to-speech functionality
 */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  // Check if speech synthesis is supported
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  // Stop any active speech when component unmounts
  useEffect(() => {
    return () => {
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  /**
   * Speak the detection results
   */
  const speakResults = useCallback((detectedObjects: DetectedObject[]) => {
    if (!supported || detectedObjects.length === 0) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create the text to be spoken
    const speechText = createSpeechText(detectedObjects);
    
    // Create and configure utterance
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Set voice to a more natural one if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Female')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Events
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    // Speak
    window.speechSynthesis.speak(utterance);
  }, [supported]);

  /**
   * Stop active speech
   */
  const stopSpeaking = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  /**
   * Play alert sound for critical issues
   */
  const playAlertSound = useCallback((severity: 'warning' | 'critical' = 'warning') => {
    // Create audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound based on severity
    if (severity === 'critical') {
      // Urgent, higher-pitched sound
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      // Modulate for attention-grabbing effect
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.4); // Back to A5
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.8);
    } else {
      // Warning sound, softer
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, []);

  return {
    speaking,
    supported,
    speakResults,
    stopSpeaking,
    playAlertSound
  };
}

/**
 * Create speech text from detected objects
 */
function createSpeechText(detectedObjects: DetectedObject[]): string {
  if (detectedObjects.length === 0) {
    return "No space station components detected.";
  }

  let speech = `Detected ${detectedObjects.length} space station components. `;
  
  // Check if there are any issues to highlight first
  const criticalIssues = detectedObjects.filter(obj => obj.issue);
  
  if (criticalIssues.length > 0) {
    speech += `Warning. Found ${criticalIssues.length} component${criticalIssues.length > 1 ? 's' : ''} with issues. `;
    
    // Add critical issues to the beginning of the speech for emphasis
    criticalIssues.forEach(obj => {
      speech += `${obj.label} has issue: ${obj.issue}. `;
    });
    
    speech += "These issues require attention. ";
  }
  
  // Add a summary of all components
  speech += "Summary of components: ";
  
  const componentsByCategory: Record<string, DetectedObject[]> = {};
  
  // Group by category
  detectedObjects.forEach(obj => {
    const category = obj.context || "Uncategorized";
    if (!componentsByCategory[category]) {
      componentsByCategory[category] = [];
    }
    componentsByCategory[category].push(obj);
  });
  
  // Read components by category
  Object.entries(componentsByCategory).forEach(([category, objects]) => {
    speech += `${category}: ${objects.map(o => o.label).join(', ')}. `;
  });
  
  // Add a confidence note
  const highConfidenceCount = detectedObjects.filter(obj => obj.confidence > 0.7).length;
  
  if (highConfidenceCount === detectedObjects.length) {
    speech += "All detections have high confidence. ";
  } else {
    speech += `${highConfidenceCount} of ${detectedObjects.length} detections have high confidence. `;
  }
  
  speech += "End of detection report.";
  
  return speech;
}