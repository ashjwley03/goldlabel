import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  TIME_OPTIONS,
  HOW_TO_TAKE_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  DURATION_OPTIONS,
  DOSAGE_OPTIONS,
  PRECAUTIONS_OPTIONS,
  PictogramOption,
} from './PictogramData';

const ALL_OPTIONS: PictogramOption[] = [
  ...TIME_OPTIONS,
  ...HOW_TO_TAKE_OPTIONS,
  ...SIDE_EFFECT_OPTIONS,
  ...DURATION_OPTIONS,
  ...DOSAGE_OPTIONS,
  ...PRECAUTIONS_OPTIONS,
];

function getOriginalIcon(pictogramId: string, size: number): React.ReactElement | null {
  const option = ALL_OPTIONS.find(o => o.id === pictogramId);
  if (!option || !option.variants.length) return null;
  return option.variants[0].icon(size);
}

const BASE_STORAGE_URL = 'https://rnqsgsxgwadtgmqowrvq.supabase.co/storage/v1/object/public/pictograms/v1';

// Mappings from schema ID to Supabase storage filename
const SCHEMA_ID_TO_FILENAME: Record<string, string> = {
  // how_to_take
  "how_to_take_dissolve_in_water": "how_to_take.dissolve_in_water_v1.png",
  "how_to_take_swallow_whole": "how_to_take.swallow_whole.png",
  "how_to_take_take_30min_before_food": "how_to_take.take_30_min_before_food.png",
  "how_to_take_take_30min_after_food": "how_to_take.take_30_min_after_food.png",
  "how_to_take_take_on_empty_stomach": "how_to_take.empty_stomach.png",
  "how_to_take_take_with_food": "how_to_take.with_food.png",
  "how_to_take_take_with_water": "how_to_take.with_water.png",
  // side_effects
  "side_effects_may_cause_drowsiness": "side_effects.drowsiness.png",
  "side_effects_may_cause_dizziness": "side_effects.dizziness.png",
  "side_effects_avoid_driving": "side_effects.do_not_drive.png",
  "side_effects_may_cause_headache": "side_effects.headache.png",
  "side_effects_may_cause_blurred_vision": "side_effects.blurred_vision.png",
  "side_effects_may_cause_tremors": "side_effects.tremors.png",
  "side_effects_may_cause_nausea": "side_effects.nausea.png",
  "side_effects_may_cause_vomiting": "side_effects.vomiting.png",
  "side_effects_may_cause_diarrhea": "side_effects.diarrhea.png",
  "side_effects_may_cause_constipation": "side_effects.constipation.png",
  "side_effects_may_cause_dry_mouth": "side_effects.dry_mouth.png",
  "side_effects_may_cause_light_sensitivity": "side_effects.light_sensitivity.png",
  "side_effects_may_cause_allergic_reaction": "side_effects.allergic_reaction.png",
  "side_effects_may_cause_muscle_weakness": "side_effects.muscle_weakness.png",
  "side_effects_may_cause_fast_heartbeat": "side_effects.fast_heartbeat.png",
  "side_effects_may_cause_fever": "side_effects.fever.png",
  "side_effects_increased_fall_risk": "side_effects.fall_risk.png",
  // time_of_day
  "time_of_day_once_daily": "time_of_day.once_daily.png",
  "time_of_day_twice_daily": "time_of_day.twice_daily.png",
  "time_of_day_thrice_daily": "time_of_day.thrice_daily.png",
  "time_of_day_morning": "time_of_day.morning.png",
  "time_of_day_noon": "time_of_day.noon.png",
  "time_of_day_night": "time_of_day.night.png",
  "time_of_day_upon_waking_up": "time_of_day.upon_waking.png",
  "time_of_day_before_bed": "time_of_day.before_bed.png",
  "time_of_day_every_4_hours": "time_of_day.every_4_hours.png",
  "time_of_day_every_8_hours": "time_of_day.every_8_hours.png",
  "time_of_day_with_breakfast": "time_of_day.with_breakfast.png",
  "time_of_day_with_lunch": "time_of_day.with_lunch.png",
  "time_of_day_with_dinner": "time_of_day.with_dinner.png",
  // precautions
  "precautions_avoid_alcohol": "precautions.no_alcohol.png",
  "precautions_avoid_dairy": "precautions.no_dairy.png",
  "precautions_avoid_grapefruit": "precautions.no_grapefruit.png",
  "precautions_keep_refrigerated": "precautions.keep_refrigerated.png",
  "precautions_keep_refrigerated_do_not_freeze": "precautions.keep_refrigerated_no_freeze.png",
  "precautions_keep_away_from_light": "precautions.keep_away_from_light.png",
  "precautions_keep_away_from_children": "precautions.keep_away_from_children.png",
  "precautions_keep_away_from_pets": "precautions.keep_away_from_pets.png",
  "precautions_dispose_properly": "precautions.dispose_properly.png",
  "precautions_do_not_share": "precautions.do_not_share.png",
  "precautions_do_not_take_if_pregnant": "precautions.not_if_pregnant.png",
  "precautions_do_not_take_if_breastfeeding": "precautions.not_if_breastfeeding.png",
  "precautions_consult_doctor_before_taking": "precautions.consult_doctor_before_taking.png",
  "precautions_consult_doctor_if_symptoms_worsen": "precautions.consult_doctor_if_symptoms_worsen.png",
  "precautions_check_expiry_date": "precautions.check_expiry_date.png",
  "precautions_discard_8_weeks_after_opening": "precautions.discard_8_weeks_after_opening.png",
  "precautions_store_in_cool_dry_place": "precautions.store_cool_dry_place.png",
  // dosage
  "dosage_half_tablet": "dosage.tablet_half.png",
  "dosage_1_tablet": "dosage.tablet_1.png",
  "dosage_1_and_half_tablets": "dosage.tablet_1_5.png",
  "dosage_2_tablets": "dosage.tablet_2.png",
  "dosage_2_and_half_tablets": "dosage.tablet_2_5.png",
  "dosage_3_tablets": "dosage.tablet_3.png",
  "dosage_3_and_half_tablets": "dosage.tablet_3_5.png",
  "dosage_4_tablets": "dosage.tablet_4.png",
  "dosage_4_and_half_tablets": "dosage.tablet_4_5.png",
  "dosage_1_teaspoon": "dosage.teaspoon_1.png",
  "dosage_2_teaspoons": "dosage.teaspoon_2.png",
  "dosage_3_teaspoons": "dosage.teaspoon_3.png",
  "dosage_1_tablespoon": "dosage.tablespoon_1.png",
  "dosage_2_tablespoons": "dosage.tablespoon_2.png",
  "dosage_3_tablespoons": "dosage.tablespoon_3.png",
  "dosage_1_ear_drop": "dosage.ear_drop_1.png",
  "dosage_2_ear_drops": "dosage.ear_drop_2.png",
  "dosage_3_ear_drops": "dosage.ear_drop_3.png",
  "dosage_4_ear_drops": "dosage.ear_drop_4.png",
  "dosage_1_eye_drop": "dosage.eye_drop_1.png",
  "dosage_2_eye_drops": "dosage.eye_drop_2.png",
  "dosage_3_eye_drops": "dosage.eye_drop_3.png",
  "dosage_4_eye_drops": "dosage.eye_drop_4.png",
  "dosage_injection_5ml": "dosage.ml_5.png",
  "dosage_injection_10ml": "dosage.ml_10.png",
  "dosage_injection_15ml": "dosage.ml_15.png",
  "dosage_injection_20ml": "dosage.ml_20.png",
  // duration
  "duration_1_day": "duration.take_1_day.png",
  "duration_2_days": "duration.take_2_days.png",
  "duration_3_days": "duration.take_3_days.png",
  "duration_4_days": "duration.take_4_days.png",
  "duration_5_days": "duration.take_5_days.png",
  "duration_6_days": "duration.take_6_days.png",
  "duration_7_days": "duration.take_7_days.png",
  "duration_8_days": "duration.take_8_days.png",
  "duration_9_days": "duration.take_9_days.png",
  "duration_10_days": "duration.take_10_days.png",
  "duration_1_week": "duration.take_1_week.png",
  "duration_2_weeks": "duration.take_2_weeks.png",
  "duration_3_weeks": "duration.take_3_weeks.png",
  "duration_4_weeks": "duration.take_4_weeks.png",
  "duration_5_weeks": "duration.take_5_weeks.png",
  "duration_6_weeks": "duration.take_6_weeks.png",
  "duration_7_weeks": "duration.take_7_weeks.png",
  "duration_8_weeks": "duration.take_8_weeks.png",
  "duration_9_weeks": "duration.take_9_weeks.png",
  "duration_10_weeks": "duration.take_10_weeks.png",
  "duration_1_month": "duration.take_1_month.png",
  "duration_2_months": "duration.take_2_months.png",
  "duration_3_months": "duration.take_3_months.png",
  "duration_4_months": "duration.take_4_months.png",
  "duration_5_months": "duration.take_5_months.png",
  "duration_6_months": "duration.take_6_months.png",
  "duration_7_months": "duration.take_7_months.png",
  "duration_8_months": "duration.take_8_months.png",
  "duration_9_months": "duration.take_9_months.png",
  "duration_10_months": "duration.take_10_months.png",
  "duration_11_months": "duration.take_11_months.png",
  "duration_12_months": "duration.take_12_months.png",
  "duration_complete_course": "duration.complete_course.png",
  "duration_stop_on_doctors_advice": "duration.stop_only_on_doctors_advice.png",
  "duration_take_until_symptoms_resolve": "duration.until_symptoms_resolve.png",
  "duration_repeat_cycle": "duration.repeat_cycle.png",
};

export function getFriendlyLabel(id: string | null): string {
  if (!id) return '';
  const clean = id.replace(/^(how_to_take|side_effects|duration|dosage|time_of_day|precautions)_/, '');
  return clean
    .split('_')
    .map(word => {
      if (word === '30min') return '30 min';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

interface ImageProps {
  pictogramId: string;
  language: string;
  size: number;
}

export function PictogramImage({ pictogramId, language, size }: ImageProps) {
  const [urlList, setUrlList] = useState<string[]>([]);
  const [currentUrlIdx, setCurrentUrlIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const filename = SCHEMA_ID_TO_FILENAME[pictogramId];
    if (!filename) {
      setError(true);
      setLoading(false);
      return;
    }

    // Fallback chain: selected language -> no-text pictogram -> original SVG
    const urls: string[] = [];
    if (language && language !== 'none') {
      urls.push(`${BASE_STORAGE_URL}/${language}/${filename}`);
    }
    urls.push(`${BASE_STORAGE_URL}/none/${filename}`);

    setUrlList(urls);
    setCurrentUrlIdx(0);
    setLoading(true);
    setError(false);
  }, [pictogramId, language]);

  const handleImageError = () => {
    if (currentUrlIdx + 1 < urlList.length) {
      setCurrentUrlIdx(prev => prev + 1);
    } else {
      setError(true);
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (error || urlList.length === 0) {
    const originalIcon = getOriginalIcon(pictogramId, size);
    if (originalIcon) {
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          {originalIcon}
        </View>
      );
    }
    return (
      <View style={[styles.placeholderBox, { width: size, height: size }]}>
        <Svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke="#B85A3C" strokeWidth="2.5" />
          <Path d="M12 8v4M12 16h.01" stroke="#B85A3C" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
        <Text style={[styles.placeholderText, { fontSize: Math.max(8, size * 0.08) }]} numberOfLines={2}>
          {getFriendlyLabel(pictogramId)}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <Image
        source={{ uri: urlList[currentUrlIdx] }}
        style={{ width: size, height: size, resizeMode: 'contain', opacity: loading ? 0 : 1 }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {loading && (
        <ActivityIndicator
          size="small"
          color="#1B3022"
          style={{ position: 'absolute' }}
        />
      )}
    </View>
  );
}

interface GridProps {
  // Array of active pictogram IDs
  pictograms: string[];
  language: string;
  layout: 'portrait' | 'square' | 'landscape';
  // Maximum number of slots to show
  maxSlots?: number;
}

export default function PictogramGrid({ pictograms, language, layout, maxSlots = 4 }: GridProps) {
  // Filter out any null/undefined/empty pictograms
  const activePictograms = pictograms.filter(Boolean).slice(0, maxSlots);

  // Pad the array up to 4 items with empty/placeholder slots if it's less
  const paddedPictograms = [...activePictograms];
  while (paddedPictograms.length < maxSlots) {
    paddedPictograms.push(''); // empty slot placeholder
  }

  const renderSlot = (id: string, index: number, cellSize: number) => {
    if (!id) {
      return (
        <View key={`empty-${index}`} style={[styles.emptyCell, { width: cellSize, height: cellSize }]}>
          <Text style={styles.emptyCellText}>Empty Slot</Text>
        </View>
      );
    }

    return (
      <View key={`${id}-${index}`} style={[styles.gridCell, { width: cellSize }]}>
        <PictogramImage pictogramId={id} language={language} size={cellSize - 16} />
        <Text style={styles.cellLabel} numberOfLines={1}>
          {getFriendlyLabel(id)}
        </Text>
      </View>
    );
  };

  if (layout === 'portrait') {
    // 4x1 layout: vertical list
    return (
      <View style={styles.portraitContainer}>
        {paddedPictograms.map((pic, idx) => renderSlot(pic, idx, 100))}
      </View>
    );
  }

  if (layout === 'landscape') {
    // 1x4 layout: horizontal row
    return (
      <View style={styles.landscapeContainer}>
        {paddedPictograms.map((pic, idx) => renderSlot(pic, idx, 76))}
      </View>
    );
  }

  // default: square (2x2)
  return (
    <View style={styles.squareContainer}>
      <View style={styles.gridRow}>
        {paddedPictograms.slice(0, 2).map((pic, idx) => renderSlot(pic, idx, 120))}
      </View>
      <View style={styles.gridRow}>
        {paddedPictograms.slice(2, 4).map((pic, idx) => renderSlot(pic, idx + 2, 120))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portraitContainer: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  landscapeContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  squareContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridCell: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 48, 34, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    aspectRatio: 1,
    shadowColor: '#1B3022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyCell: {
    backgroundColor: 'rgba(27, 48, 34, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(27, 48, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  emptyCellText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(27, 48, 34, 0.3)',
    textTransform: 'uppercase',
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1B3022',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
  },
  placeholderBox: {
    backgroundColor: '#FFF2EE',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D37B5C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  placeholderText: {
    color: '#D37B5C',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
});
