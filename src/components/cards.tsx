import { Armchair, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ClubSummary, ProjectSummary } from '../data/types';
import { colors, type } from '../theme';
import { Card, ProgressBar, T, Tag } from './ui';

export function ClubCard({ club, onPress }: { club: ClubSummary; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={s.club}>
        <View style={[s.clubIcon, { backgroundColor: club.iconBg }]}>
          <Armchair size={22} color={club.iconFg} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T style={type.title}>{club.name}</T>
          <T style={type.small}>{club.desc}</T>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 }}>
            {club.open ? <Tag label="porta aberta" tone="green" /> : null}
            <Text style={type.mono}>{club.meta}</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.muted} />
      </Card>
    </Pressable>
  );
}

export function ProjectCard({ project, onPress }: { project: ProjectSummary; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ padding: 14, gap: 8 }}>
        <T style={type.title}>{project.name}</T>
        <T style={type.small}>{project.desc}</T>
        <ProgressBar pct={project.pct} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={type.mono}>{project.raised}</Text>
          <Text style={type.mono}>
            {project.pct}% · {project.daysLeft}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const s = StyleSheet.create({
  club: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 14 },
  clubIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
