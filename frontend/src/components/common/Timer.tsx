import { useEffect, useState } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';

interface TimerProps {
  retroId: string;
  isFacilitator: boolean;
}

function Timer({ retroId, isFacilitator }: TimerProps) {
  const timer = useRetroStore((state) => state.retrospective?.timer);
  const [duration, setDuration] = useState(5); // minutes
  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    socketService.startTimer(retroId, duration * 60);
    setShowSettings(false);
  };

  const handleStop = () => {
    socketService.stopTimer(retroId);
  };

  const handleReset = () => {
    socketService.stopTimer(retroId);
    setShowSettings(true);
  };

  if (!isFacilitator && !timer?.isRunning) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">Timer</span>
        </div>

        {timer?.isRunning ? (
          <div className="flex items-center space-x-4">
            <div className={`text-2xl font-bold ${
              timer.remainingTime <= 60 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatTime(timer.remainingTime)}
            </div>
            {isFacilitator && (
              <div className="flex space-x-2">
                <button
                  onClick={handleStop}
                  className="btn-secondary p-2"
                  title="Pause"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="btn-secondary p-2"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : isFacilitator && (
          <div className="flex items-center space-x-3">
            {showSettings ? (
              <>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">minutes</span>
                <button
                  onClick={handleStart}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Démarrer</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowSettings(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Configurer le timer</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Timer;
