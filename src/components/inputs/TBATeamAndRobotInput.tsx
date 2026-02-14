import { useEvent } from '@/hooks';
import {
  getFieldValue,
  inputSelector,
  updateValue,
  useQRScoutState,
} from '@/store/store';
import React, { useCallback, useEffect, useMemo } from 'react';
import { TBATeamAndRobotInputData } from './BaseInputProps';
import { ConfigurableInputProps } from './ConfigurableInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type TBATeamAndRobotData = {
  teamNumber: number;
  robotPosition: string;
};

export default function TBATeamAndRobotInput(props: ConfigurableInputProps) {
  const data = useQRScoutState(
    inputSelector<TBATeamAndRobotInputData>(props.section, props.code),
  );

  const matchData = useQRScoutState(state => state.matchData);

  const selectedMatchNumber = useQRScoutState(() => {
    const v = getFieldValue('matchNumber');
    return typeof v === 'number' ? v : null;
  });

  if (!data) return <div>Invalid input</div>;

  // ✅ TS FIX: ensure state is TBATeamAndRobotData | null
  const [value, setValue] = React.useState<TBATeamAndRobotData | null>(
    (data.defaultValue as TBATeamAndRobotData) ?? null,
  );

  const teamOptions = useMemo(() => {
    if (!matchData || matchData.length === 0 || !selectedMatchNumber) return [];

    const match = matchData.find(
      m => m.comp_level === 'qm' && m.match_number === selectedMatchNumber,
    );
    if (!match) return [];

    const teams: Array<{
      teamNumber: number;
      robotPosition: string;
      alliance: 'Red' | 'Blue';
      position: number;
    }> = [];

    match.alliances.red.team_keys.forEach((teamKey, index) => {
      const teamNumber = parseInt(teamKey.substring(3));
      if (!isNaN(teamNumber)) {
        teams.push({
          teamNumber,
          robotPosition: `R${index + 1}`,
          alliance: 'Red',
          position: index + 1,
        });
      }
    });

    match.alliances.blue.team_keys.forEach((teamKey, index) => {
      const teamNumber = parseInt(teamKey.substring(3));
      if (!isNaN(teamNumber)) {
        teams.push({
          teamNumber,
          robotPosition: `B${index + 1}`,
          alliance: 'Blue',
          position: index + 1,
        });
      }
    });

    return teams;
  }, [matchData, selectedMatchNumber]);

  const resetState = useCallback(
    ({ force }: { force: boolean }) => {
      if (force) {
        setValue((data.defaultValue as TBATeamAndRobotData) ?? null);
        return;
      }
      if (data.formResetBehavior === 'preserve') return;

      setValue((data.defaultValue as TBATeamAndRobotData) ?? null);
    },
    [data.defaultValue, data.formResetBehavior],
  );

  useEvent('resetFields', resetState);

  useEffect(() => {
    updateValue(props.code, value);
  }, [value, props.code]);

  const handleSelectChange = useCallback((selectedValue: string) => {
    const [teamNumberStr, robotPosition] = selectedValue.split('|');
    const teamNumber = parseInt(teamNumberStr);
    if (isNaN(teamNumber)) return;

    setValue({ teamNumber, robotPosition });
  }, []);

  // If we have TBA match teams available, show dropdown
  if (teamOptions.length > 0) {
    return (
      <Select
        name={data.title}
        onValueChange={handleSelectChange}
        value={value ? `${value.teamNumber}|${value.robotPosition}` : ''}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
          {teamOptions.map(team => (
            <SelectItem
              key={`${team.teamNumber}|${team.robotPosition}`}
              value={`${team.teamNumber}|${team.robotPosition}`}
            >
              Team {team.teamNumber} ({team.alliance} {team.position})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Fallback: manual team number entry
  return (
    <Input
      type="number"
      value={value?.teamNumber ?? ''}
      id={data.title}
      placeholder="Enter team number"
      onChange={e => {
        const raw = e.target.value;

        if (raw === '') {
          setValue(null);
          return;
        }

        const parsed = Number(raw);
        if (Number.isNaN(parsed)) return;

        setValue({
          teamNumber: parsed,
          robotPosition: '',
        });
      }}
    />
  );
}