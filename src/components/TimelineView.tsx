'use client';

import React from 'react';
import { TimelineSegment } from '@/types/pulse0';
import { formatDuration } from '@/lib/utils/pulseUtils';
import styles from './TimelineView.module.css';

interface TimelineViewProps {
  segments: TimelineSegment[];
  flagCount?: number;
  timeScale?: number; // pixels per unit
  timeUnit?: 'ns' | 'us' | 'ms' | 's';
  showTiming?: boolean;
  showOpcodes?: boolean;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  segments,
  flagCount = 8,
  timeScale = 1,
  timeUnit = 'us',
  showTiming = true,
  showOpcodes = true,
}) => {
  const [mousePosition, setMousePosition] = React.useState<number | null>(null);
  const [isMouseOver, setIsMouseOver] = React.useState(false);
  if (segments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>No pulse program loaded</p>
      </div>
    );
  }

  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
  
  // Convert nanoseconds to the selected unit for scaling
  const getScaledDuration = (durationNs: number) => {
    switch (timeUnit) {
      case 'ns': return durationNs;
      case 'us': return durationNs / 1000;
      case 'ms': return durationNs / 1000000;
      case 's': return durationNs / 1000000000;
      default: return durationNs / 1000;
    }
  };
  
  const scaledTotalDuration = getScaledDuration(totalDuration);
  const totalWidth = Math.max(scaledTotalDuration * timeScale, 800);
  
  // Get time at mouse position
  const getTimeAtPosition = (x: number) => {
    const timeInSelectedUnit = x / timeScale;
    return timeInSelectedUnit;
  };
  
  // Format time for display
  const formatTime = (timeInSelectedUnit: number) => {
    if (timeInSelectedUnit < 0.001) return '0';
    
    if (timeInSelectedUnit >= 1000 && timeUnit !== 's') {
      if (timeUnit === 'ns') return `${(timeInSelectedUnit / 1000).toFixed(2)} μs`;
      if (timeUnit === 'us') return `${(timeInSelectedUnit / 1000).toFixed(2)} ms`;
      if (timeUnit === 'ms') return `${(timeInSelectedUnit / 1000).toFixed(2)} s`;
    }
    
    const decimals = timeUnit === 'ns' ? 0 : timeUnit === 'us' ? 2 : timeUnit === 'ms' ? 3 : 4;
    return `${timeInSelectedUnit.toFixed(decimals)} ${timeUnit}`;
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Ensure the position is within the timeline track bounds
    if (x >= 0 && x <= totalWidth) {
      setMousePosition(x);
    }
  };
  
  const handleMouseEnter = () => {
    setIsMouseOver(true);
  };
  
  const handleMouseLeave = () => {
    setIsMouseOver(false);
    setMousePosition(null);
  };

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineContent}>
        <h3 className={styles.timelineTitle}>Pulse Timeline</h3>
        <div className={styles.timelineWrapper}>
          {/* Time axis */}
          {showTiming && (
            <div className={styles.timeAxis}>
              <div 
                className={styles.timeAxisContent}
                style={{ width: `${totalWidth}px`, position: 'relative' }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Time indicator line */}
                {isMouseOver && mousePosition !== null && (
                  <div
                    className={styles.timeIndicator}
                    style={{ left: `${mousePosition}px` }}
                  >
                    <div className={styles.timeIndicatorLine} />
                    <div className={styles.timeIndicatorLabel}>
                      {formatTime(getTimeAtPosition(mousePosition))}
                    </div>
                  </div>
                )}
                {segments.map((segment, index) => {
                  const leftPos = getScaledDuration(segment.startTime) * timeScale;
                  const width = getScaledDuration(segment.duration) * timeScale;
                  return (
                    <div
                      key={index}
                      className={styles.timeMarker}
                      style={{ left: `${leftPos}px`, width: `${width}px` }}
                    >
                      <span className={styles.timeMarkerText}>{formatDuration(segment.duration)}</span>
                      <div className={styles.timeMarkerLine} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Flag channels */}
          {Array.from({ length: flagCount }, (_, flagIndex) => (
            <div key={flagIndex} className={styles.flagRow}>
              <div className={styles.flagLabel}>
                Flag {flagIndex}
              </div>
              <div 
                className={styles.flagTrack}
                style={{ width: `${totalWidth}px` }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Time indicator line for this row */}
                {isMouseOver && mousePosition !== null && (
                  <div
                    className={styles.timeIndicatorForTrack}
                    style={{ left: `${mousePosition}px` }}
                  />
                )}
                {segments.map((segment, segIndex) => {
                  const leftPos = getScaledDuration(segment.startTime) * timeScale;
                  const width = getScaledDuration(segment.duration) * timeScale;
                  const isHigh = segment.flags[flagIndex];
                  
                  return (
                    <div
                      key={segIndex}
                      className={`${styles.segment} ${isHigh ? styles.segmentHigh : styles.segmentLow}`}
                      style={{ 
                        left: `${leftPos}px`, 
                        width: `${Math.max(width, 1)}px` 
                      }}
                    >
                      <div className={styles.tooltip}>
                        Flag {flagIndex}: {isHigh ? 'HIGH' : 'LOW'}
                        <br />
                        Duration: {formatDuration(segment.duration)}
                        <br />
                        Opcode: {segment.opcode}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Opcode track */}
          {showOpcodes && (
            <div className={styles.opcodeRow}>
              <div className={styles.opcodeLabel}>
                Opcodes
              </div>
              <div 
                className={styles.opcodeTrack}
                style={{ width: `${totalWidth}px` }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Time indicator line for this row */}
                {isMouseOver && mousePosition !== null && (
                  <div
                    className={styles.timeIndicatorForTrack}
                    style={{ left: `${mousePosition}px` }}
                  />
                )}
                {segments.map((segment, index) => {
                  const leftPos = getScaledDuration(segment.startTime) * timeScale;
                  const width = getScaledDuration(segment.duration) * timeScale;
                  
                  return (
                    <div
                      key={index}
                      className={styles.opcodeSegment}
                      style={{ 
                        left: `${leftPos}px`, 
                        width: `${Math.max(width, 1)}px` 
                      }}
                    >
                      <span className={styles.opcodeText}>
                        {segment.opcode}
                      </span>
                      
                      <div className={styles.tooltip}>
                        Opcode: {segment.opcode}
                        <br />
                        Data: {segment.instruction.data}
                        <br />
                        Duration: {formatDuration(segment.duration)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;