import { useState, useCallback } from 'react';
import { useQRScoutState, setMatchData } from '@/store/store';
import { fetchTeamEvents, fetchEventMatches } from '@/util/theBlueAlliance';
import { EventData } from '@/types/eventData';
import { EventSelectionDialog } from './EventSelectionDialog';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';

type MatchDataFetcherProps = {
  onError: (message: string) => void;
  className?: string;
};

export function MatchDataFetcher({ onError, className }: MatchDataFetcherProps) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formData = useQRScoutState(state => state.formData);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);

      const teamNumber = formData.teamNumber;
      if (!teamNumber) {
        onError('Team number is required to fetch event data');
        return;
      }

      const year = formData.year;

      const result = await fetchTeamEvents(teamNumber, year);

      // ✅ TS-safe narrowing (works even if success isn't a discriminant)
      if ('error' in result) {
        onError(result.error.message);
        return;
      }

      if (result.data.length === 0) {
        onError('No events found for this team in the current year');
        return;
      }

      setEvents(result.data);
      setIsEventDialogOpen(true);
    } catch {
      onError('Failed to fetch event data. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, onError]);

  const handleEventSelected = useCallback(async (eventKey: string) => {
    const result = await fetchEventMatches(eventKey);

    // ✅ TS-safe narrowing
    if ('error' in result) {
      throw new Error(result.error.message);
    }

    if (result.data.length === 0) {
      throw new Error('No match data available for this event yet');
    }

    setMatchData(result.data);
    setIsEventDialogOpen(false);
  }, []);

  return (
    <>
      <EventSelectionDialog
        isOpen={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        events={events}
        onEventSelected={handleEventSelected}
        onClose={() => setIsEventDialogOpen(false)}
      />

      <Button
        variant="secondary"
        onClick={fetchEvents}
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
        ) : (
          <Database className="h-5 w-5 flex-shrink-0" />
        )}
        <span className="overflow-hidden text-ellipsis">
          {isLoading ? 'Loading...' : 'Prefill Match Data'}
        </span>
      </Button>
    </>
  );
}