import React from 'react';
import Svg, { Circle, Path, Rect, Ellipse, Line } from 'react-native-svg';
import { OptionSelection } from '../types';

export type { OptionSelection };

export type IconFactory = (size: number) => React.ReactElement;

export interface PictogramVariant {
  id: string;
  label: string;
  icon: IconFactory;
}

export interface PictogramOption {
  id: string;
  label: string;
  variants: PictogramVariant[];
}

export function getIcon(
  options: PictogramOption[],
  optionId: string,
  variantId: string,
  size: number
): React.ReactElement | null {
  const option = options.find((o) => o.id === optionId);
  if (!option) return null;
  const variant = option.variants.find((v) => v.id === variantId) ?? option.variants[0];
  return variant.icon(size);
}

// Helper to build a generic placeholder SVG
const makePlaceholderVariant = (label: string) => ({
  id: 'v0',
  label,
  icon: (s: number) => (
    <Svg width={s} height={s} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="40" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="3" />
      <Path d="M45 45 L75 75 M75 45 L45 75" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  )
});

// ─── TIME OF DAY ─────────────────────────────────────────────────────────────

export const TIME_OPTIONS: PictogramOption[] = [
  {
    id: 'time_of_day_morning',
    label: 'Morning',
    variants: [
      {
        id: 'v0',
        label: 'Rising sun',
        icon: (s) => (
          <Svg key="m-v0" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="68" r="28" fill="#FDB462" stroke="#F57C00" strokeWidth="4" />
            <Path d="M60 20 L60 34 M25 45 L35 52 M95 45 L85 52 M5 75 L20 75 M100 75 L115 75" stroke="#F57C00" strokeWidth="5" strokeLinecap="round" />
            <Path d="M15 95 L105 95" stroke="#6B7FD7" strokeWidth="5" strokeLinecap="round" />
          </Svg>
        ),
      },
      {
        id: 'v1',
        label: 'Sunrise',
        icon: (s) => (
          <Svg key="m-v1" width={s} height={s} viewBox="0 0 120 120">
            <Path d="M10 85 Q60 40 110 85" fill="#FDB462" fillOpacity="0.3" stroke="#F57C00" strokeWidth="3" strokeLinecap="round" />
            <Circle cx="60" cy="82" r="22" fill="#FDB462" stroke="#F57C00" strokeWidth="4" />
            <Path d="M60 18 L60 32" stroke="#F57C00" strokeWidth="5" strokeLinecap="round" />
            <Path d="M25 38 L33 46" stroke="#F57C00" strokeWidth="4" strokeLinecap="round" />
            <Path d="M95 38 L87 46" stroke="#F57C00" strokeWidth="4" strokeLinecap="round" />
            <Path d="M8 82 L28 82 M92 82 L112 82" stroke="#F57C00" strokeWidth="4" strokeLinecap="round" />
            <Path d="M10 100 L110 100" stroke="#6B7FD7" strokeWidth="5" strokeLinecap="round" />
          </Svg>
        ),
      },
      {
        id: 'v2',
        label: 'Dawn glow',
        icon: (s) => (
          <Svg key="m-v2" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="22" fill="#FDB462" />
            <Circle cx="60" cy="60" r="34" fill="#FDB462" fillOpacity="0.25" />
            <Path d="M60 8 L60 22 M60 98 L60 112 M8 60 L22 60 M98 60 L112 60" stroke="#F57C00" strokeWidth="5" strokeLinecap="round" />
            <Path d="M22 22 L32 32 M88 88 L98 98 M98 22 L88 32 M22 98 L32 88" stroke="#F57C00" strokeWidth="4" strokeLinecap="round" />
            <Path d="M10 105 L110 105" stroke="#6B7FD7" strokeWidth="5" strokeLinecap="round" />
          </Svg>
        ),
      },
    ],
  },
  {
    id: 'time_of_day_noon',
    label: 'Noon',
    variants: [
      {
        id: 'v0',
        label: 'High sun',
        icon: (s) => (
          <Svg key="n-v0" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="50" r="22" fill="#FF9B54" />
            <Circle cx="60" cy="50" r="33" fill="#FF9B54" fillOpacity="0.2" />
            <Path d="M60 5 L60 18 M60 82 L60 95 M15 50 L28 50 M92 50 L105 50" stroke="#FF9B54" strokeWidth="5" strokeLinecap="round" />
            <Path d="M27 17 L36 26 M84 74 L93 83 M93 17 L84 26 M27 83 L36 74" stroke="#FF9B54" strokeWidth="4" strokeLinecap="round" />
            <Path d="M10 108 L110 108" stroke="#6B7FD7" strokeWidth="5" strokeLinecap="round" />
          </Svg>
        ),
      },
      {
        id: 'v1',
        label: 'Peak sun',
        icon: (s) => (
          <Svg key="n-v1" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="55" r="26" fill="#FF9B54" stroke="#E65100" strokeWidth="3" />
            <Path d="M60 8 L60 22 M60 88 L60 102 M8 55 L22 55 M98 55 L112 55" stroke="#FF9B54" strokeWidth="5" strokeLinecap="round" />
            <Path d="M22 22 L31 31 M89 79 L98 88 M98 22 L89 31 M22 88 L31 79" stroke="#FF9B54" strokeWidth="4" strokeLinecap="round" />
            <Path d="M30 10 L38 20 M82 10 L74 20" stroke="#FDB462" strokeWidth="3" strokeLinecap="round" />
            <Path d="M10 108 L110 108" stroke="#6B7FD7" strokeWidth="5" strokeLinecap="round" />
          </Svg>
        ),
      },
      {
        id: 'v2',
        label: 'Midday clock',
        icon: (s) => (
          <Svg key="n-v2" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="68" r="36" fill="#FFF9C4" stroke="#F57C00" strokeWidth="4" />
            <Line x1="60" y1="68" x2="60" y2="44" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
            <Line x1="60" y1="68" x2="60" y2="46" stroke="#1B3022" strokeWidth="3" strokeLinecap="round" />
            <Circle cx="60" cy="68" r="4" fill="#1B3022" />
            <Path d="M56 48 L56 58 L60 58" stroke="#1B3022" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="60" cy="18" r="11" fill="#FF9B54" stroke="#E65100" strokeWidth="3" />
            <Path d="M55 15 L55 21 M65 15 L65 21" stroke="#E65100" strokeWidth="2" strokeLinecap="round" />
            <Path d="M57 18 L63 18" stroke="#E65100" strokeWidth="2" strokeLinecap="round" />
          </Svg>
        ),
      },
    ],
  },
  {
    id: 'time_of_day_night',
    label: 'Night',
    variants: [
      {
        id: 'v0',
        label: 'Moon & stars',
        icon: (s) => (
          <Svg key="ni-v0" width={s} height={s} viewBox="0 0 120 120">
            <Path d="M75 30 C55 35,42 52,45 72 C48 92,65 102,82 98 C62 108,38 95,30 72 C22 49,38 27,60 22 C65 20,70 24,75 30Z" fill="#6B7FD7" stroke="#4A5DA8" strokeWidth="3" />
            <Circle cx="85" cy="25" r="4" fill="#FDB462" />
            <Circle cx="95" cy="45" r="3" fill="#FDB462" />
            <Circle cx="78" cy="55" r="2.5" fill="#FDB462" />
            <Circle cx="100" cy="30" r="2" fill="#FDB462" />
          </Svg>
        ),
      },
      {
        id: 'v1',
        label: 'Moon & cloud',
        icon: (s) => (
          <Svg key="ni-v1" width={s} height={s} viewBox="0 0 120 120">
            <Path d="M62 22 C50 26,40 40,43 56 C46 70,58 78,70 74 C55 82,36 70,32 52 C28 34,42 18,60 17 C63 17,63 20,62 22Z" fill="#6B7FD7" stroke="#4A5DA8" strokeWidth="3" />
            <Circle cx="88" cy="30" r="4" fill="#FDB462" />
            <Circle cx="98" cy="48" r="3" fill="#FDB462" />
            <Ellipse cx="75" cy="85" rx="26" ry="14" fill="white" stroke="#D1D5DB" strokeWidth="2" />
            <Ellipse cx="60" cy="88" rx="16" ry="12" fill="white" stroke="#D1D5DB" strokeWidth="2" />
            <Ellipse cx="92" cy="88" rx="13" ry="10" fill="white" stroke="#D1D5DB" strokeWidth="2" />
          </Svg>
        ),
      },
      {
        id: 'v2',
        label: 'Starry sky',
        icon: (s) => (
          <Svg key="ni-v2" width={s} height={s} viewBox="0 0 120 120">
            <Rect width="120" height="120" rx="10" fill="#1E293B" />
            <Path d="M55 28 C44 32,36 46,39 60 C42 74,55 82,68 78 C52 86,33 75,28 58 C23 41,36 24,54 22 C57 21,57 25,55 28Z" fill="#6B7FD7" />
            <Circle cx="86" cy="18" r="3" fill="white" />
            <Circle cx="96" cy="35" r="2" fill="white" />
            <Circle cx="102" cy="55" r="2.5" fill="white" />
            <Circle cx="90" cy="65" r="2" fill="white" />
            <Circle cx="108" cy="78" r="1.5" fill="white" />
            <Circle cx="76" cy="14" r="2" fill="white" />
            <Circle cx="105" cy="20" r="1.5" fill="white" />
          </Svg>
        ),
      },
    ],
  },
  {
    id: 'time_of_day_before_bed',
    label: 'Before Bed',
    variants: [
      {
        id: 'v0',
        label: 'Crescent',
        icon: (s) => (
          <Svg key="bb-v0" width={s} height={s} viewBox="0 0 120 120">
            <Path d="M55 25 C65 30,70 42,68 54 C80 49,90 58,86 72 C74 70,63 77,48 72 C50 60,46 44,55 25Z" fill="#4A5568" stroke="#2D3748" strokeWidth="3" />
            <Circle cx="38" cy="38" r="5" fill="#FDB462" />
            <Circle cx="74" cy="54" r="3.5" fill="#FDB462" />
            <Circle cx="55" cy="28" r="2.5" fill="#FDB462" />
          </Svg>
        ),
      },
      {
        id: 'v1',
        label: 'Bed',
        icon: (s) => (
          <Svg key="bb-v1" width={s} height={s} viewBox="0 0 120 120">
            <Rect x="18" y="62" width="84" height="34" rx="6" fill="#6B7FD7" stroke="#4A5DA8" strokeWidth="3" />
            <Rect x="18" y="48" width="38" height="18" rx="6" fill="#9CA3AF" stroke="#6B7280" strokeWidth="2" />
            <Rect x="18" y="54" width="84" height="12" rx="4" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2" />
            <Rect x="22" y="44" width="9" height="20" rx="3" fill="#4A5568" />
            <Rect x="89" y="44" width="9" height="20" rx="3" fill="#4A5568" />
            <Path d="M22 96 L22 106 M98 96 L98 106" stroke="#4A5568" strokeWidth="4" strokeLinecap="round" />
            <Circle cx="88" cy="22" r="14" fill="#4A5568" fillOpacity="0.5" />
            <Path d="M80 22 C86 16,94 20,92 28 C86 26,80 30,80 22Z" fill="#FDB462" />
          </Svg>
        ),
      },
      {
        id: 'v2',
        label: 'Pillow & Zzz',
        icon: (s) => (
          <Svg key="bb-v2" width={s} height={s} viewBox="0 0 120 120">
            <Ellipse cx="60" cy="78" rx="42" ry="22" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="3" />
            <Ellipse cx="60" cy="74" rx="34" ry="16" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="2" />
            <Path d="M52 36 L68 36 L62 46 L76 46" stroke="#6B7FD7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M60 52 L72 52 L67 60 L78 60" stroke="#6B7FD7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M66 24 L74 24 L71 30 L78 30" stroke="#6B7FD7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ),
      },
    ],
  },
  { id: 'time_of_day_once_daily', label: 'Once Daily', variants: [makePlaceholderVariant('Once Daily')] },
  { id: 'time_of_day_twice_daily', label: 'Twice Daily', variants: [makePlaceholderVariant('Twice Daily')] },
  { id: 'time_of_day_thrice_daily', label: 'Thrice Daily', variants: [makePlaceholderVariant('Thrice Daily')] },
  { id: 'time_of_day_upon_waking_up', label: 'Upon Waking Up', variants: [makePlaceholderVariant('Upon Waking Up')] },
  { id: 'time_of_day_every_4_hours', label: 'Every 4 Hours', variants: [makePlaceholderVariant('Every 4 Hours')] },
  { id: 'time_of_day_every_8_hours', label: 'Every 8 Hours', variants: [makePlaceholderVariant('Every 8 Hours')] },
  { id: 'time_of_day_with_breakfast', label: 'With Breakfast', variants: [makePlaceholderVariant('With Breakfast')] },
  { id: 'time_of_day_with_lunch', label: 'With Lunch', variants: [makePlaceholderVariant('With Lunch')] },
  { id: 'time_of_day_with_dinner', label: 'With Dinner', variants: [makePlaceholderVariant('With Dinner')] },
];

// ─── HOW TO TAKE ─────────────────────────────────────────────────────────────

export const HOW_TO_TAKE_OPTIONS: PictogramOption[] = [
  {
    id: 'how_to_take_take_with_food',
    label: 'With Food',
    variants: [
      {
        id: 'v0',
        label: 'Plate & cutlery',
        icon: (s) => (
          <Svg key="wf-v0" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="65" r="35" fill="#A5D6A7" stroke="#2D5F3F" strokeWidth="4" />
            <Path d="M45 48 L45 82" stroke="#2D5F3F" strokeWidth="4" strokeLinecap="round" />
            <Path d="M38 48 L38 60 Q38 68 45 68" stroke="#2D5F3F" strokeWidth="3.5" strokeLinecap="round" />
            <Path d="M52 48 L52 60 Q52 68 45 68" stroke="#2D5F3F" strokeWidth="3.5" strokeLinecap="round" />
            <Path d="M75 48 L75 82 M68 48 L82 48 L82 62 Q82 70 75 70" stroke="#2D5F3F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ),
      },
      {
        id: 'v1',
        label: 'Bowl & steam',
        icon: (s) => (
          <Svg key="wf-v1" width={s} height={s} viewBox="0 0 120 120">
            <Path d="M25 72 Q25 98 60 98 Q95 98 95 72 Z" fill="#A5D6A7" stroke="#2D5F3F" strokeWidth="4" />
            <Path d="M22 72 L98 72" stroke="#2D5F3F" strokeWidth="4" strokeLinecap="round" />
            <Path d="M40 105 L80 105" stroke="#2D5F3F" strokeWidth="4" strokeLinecap="round" />
            <Path d="M45 58 Q42 48 45 38 Q48 28 45 18" stroke="#2D5F3F" strokeWidth="3" strokeLinecap="round" />
            <Path d="M60 58 Q57 48 60 38 Q63 28 60 18" stroke="#2D5F3F" strokeWidth="3" strokeLinecap="round" />
            <Path d="M75 58 Q72 48 75 38 Q78 28 75 18" stroke="#2D5F3F" strokeWidth="3" strokeLinecap="round" />
          </Svg>
        ),
      },
      {
        id: 'v2',
        label: 'Fork & spoon',
        icon: (s) => (
          <Svg key="wf-v2" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="42" fill="#A5D6A7" fillOpacity="0.4" stroke="#2D5F3F" strokeWidth="3" />
            <Path d="M42 22 L42 75" stroke="#2D5F3F" strokeWidth="5" strokeLinecap="round" />
            <Path d="M36 22 L36 40 Q36 50 42 50" stroke="#2D5F3F" strokeWidth="4" strokeLinecap="round" />
            <Path d="M48 22 L48 40 Q48 50 42 50" stroke="#2D5F3F" strokeWidth="4" strokeLinecap="round" />
            <Circle cx="78" cy="34" r="12" fill="none" stroke="#2D5F3F" strokeWidth="4" />
            <Path d="M78 46 L78 98" stroke="#2D5F3F" strokeWidth="5" strokeLinecap="round" />
          </Svg>
        ),
      },
    ],
  },
  {
    id: 'how_to_take_take_on_empty_stomach',
    label: 'Empty Stomach',
    variants: [
      {
        id: 'v0',
        label: 'Plate with X',
        icon: (s) => (
          <Svg key="es-v0" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="65" r="35" fill="#FFCCBC" stroke="#D37B5C" strokeWidth="4" />
            <Path d="M45 48 L45 82" stroke="#D37B5C" strokeWidth="4" strokeLinecap="round" />
            <Path d="M38 48 L38 60 Q38 68 45 68" stroke="#D37B5C" strokeWidth="3.5" strokeLinecap="round" />
            <Path d="M52 48 L52 60 Q52 68 45 68" stroke="#D37B5C" strokeWidth="3.5" strokeLinecap="round" />
            <Path d="M75 48 L75 82 M68 48 L82 48 L82 62 Q82 70 75 70" stroke="#D37B5C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M22 22 L98 98 M98 22 L22 98" stroke="#D37B5C" strokeWidth="6" strokeLinecap="round" opacity="0.65" />
          </Svg>
        ),
      },
      {
        id: 'v1',
        label: 'No food circle',
        icon: (s) => (
          <Svg key="es-v1" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="44" fill="#FFCCBC" fillOpacity="0.3" stroke="#D37B5C" strokeWidth="5" />
            <Path d="M24 24 L96 96" stroke="#D37B5C" strokeWidth="6" strokeLinecap="round" />
            <Path d="M40 45 L40 78" stroke="#D37B5C" strokeWidth="4" strokeLinecap="round" />
            <Path d="M33 45 L33 58 Q33 65 40 65" stroke="#D37B5C" strokeWidth="3.5" strokeLinecap="round" />
            <Path d="M47 45 L47 58 Q47 65 40 65" stroke="#D37B5C" strokeWidth="3.5" strokeLinecap="round" />
            <Circle cx="80" cy="48" r="11" fill="none" stroke="#D37B5C" strokeWidth="4" />
            <Path d="M80 59 L80 82" stroke="#D37B5C" strokeWidth="5" strokeLinecap="round" />
          </Svg>
        ),
      },
      {
        id: 'v2',
        label: 'Before meal',
        icon: (s) => (
          <Svg key="es-v2" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="30" r="18" fill="#FFF9C4" stroke="#F57C00" strokeWidth="3" />
            <Line x1="60" y1="30" x2="60" y2="19" stroke="#1B3022" strokeWidth="3" strokeLinecap="round" />
            <Line x1="60" y1="30" x2="69" y2="30" stroke="#1B3022" strokeWidth="3" strokeLinecap="round" />
            <Path d="M60 52 L60 62" stroke="#D37B5C" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
            <Circle cx="60" cy="78" r="28" fill="#FFCCBC" stroke="#D37B5C" strokeWidth="3" />
            <Path d="M46 78 L56 78 M64 78 L74 78" stroke="#D37B5C" strokeWidth="3" strokeLinecap="round" />
          </Svg>
        ),
      },
    ],
  },
  {
    id: 'how_to_take_swallow_whole',
    label: 'Swallow Whole',
    variants: [
      {
        id: 'v0',
        label: 'Swallow whole pill',
        icon: (s) => (
          <Svg key="cr-v0" width={s} height={s} viewBox="0 0 120 120">
            <Ellipse cx="60" cy="55" rx="30" ry="15" fill="#D37B5C" stroke="#B85A3C" strokeWidth="4" />
            <Path d="M40 70 Q60 80 80 70" stroke="#B85A3C" strokeWidth="4" strokeLinecap="round" />
            <Path d="M50 40 L70 40 M55 35 L65 35" stroke="#B85A3C" strokeWidth="4" strokeLinecap="round" />
            <Path d="M35 85 L85 85" stroke="#1B3022" strokeWidth="3" strokeLinecap="round" />
          </Svg>
        ),
      }
    ],
  },
  {
    id: 'how_to_take_take_with_water',
    label: 'With Water',
    variants: [
      {
        id: 'v0',
        label: 'Water drop',
        icon: (s) => (
          <Svg key="ww-v0" width={s} height={s} viewBox="0 0 120 120">
            <Path d="M60 18 L76 52 L76 76 C76 85 69 92 60 92 C51 92 44 85 44 76 L44 52 Z" fill="#6B7FD7" stroke="#5469C4" strokeWidth="4" />
            <Ellipse cx="57" cy="62" rx="8" ry="5" fill="white" opacity="0.4" />
          </Svg>
        ),
      },
      {
        id: 'v1',
        label: 'Glass of water',
        icon: (s) => (
          <Svg key="ww-v1" width={s} height={s} viewBox="0 0 120 120">
            <Path d="M35 28 L40 98 L80 98 L85 28 Z" fill="#6B7FD7" fillOpacity="0.5" stroke="#5469C4" strokeWidth="4" strokeLinejoin="round" />
            <Path d="M37 58 L83 58" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <Path d="M38 72 L82 72" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <Path d="M38 104 L82 104" stroke="#5469C4" strokeWidth="4" strokeLinecap="round" />
          </Svg>
        ),
      },
      {
        id: 'v2',
        label: 'Water bottle',
        icon: (s) => (
          <Svg key="ww-v2" width={s} height={s} viewBox="0 0 120 120">
            <Rect x="46" y="20" width="28" height="10" rx="4" fill="#5469C4" />
            <Rect x="40" y="28" width="40" height="8" rx="2" fill="#6B7FD7" />
            <Path d="M40 36 L35 98 L85 98 L80 36 Z" fill="#6B7FD7" fillOpacity="0.6" stroke="#5469C4" strokeWidth="3" strokeLinejoin="round" />
            <Path d="M38 66 L82 66" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <Ellipse cx="60" cy="60" rx="14" ry="4" fill="white" fillOpacity="0.2" />
          </Svg>
        ),
      },
    ],
  },
  { id: 'how_to_take_dissolve_in_water', label: 'Dissolve in Water', variants: [makePlaceholderVariant('Dissolve in Water')] },
  { id: 'how_to_take_take_30min_before_food', label: 'Take 30 Min Before Food', variants: [makePlaceholderVariant('30 Min Before Food')] },
  { id: 'how_to_take_take_30min_after_food', label: 'Take 30 Min After Food', variants: [makePlaceholderVariant('30 Min After Food')] },
];

// ─── SIDE EFFECTS ─────────────────────────────────────────────────────────────

export const SIDE_EFFECT_OPTIONS: PictogramOption[] = [
  {
    id: 'side_effects_may_cause_drowsiness',
    label: 'May Cause Drowsiness',
    variants: [
      {
        id: 'v0',
        label: 'Tired face',
        icon: (s) => (
          <Svg key="dr-v0" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="35" fill="#FFCCBC" stroke="#FF8A65" strokeWidth="4" />
            <Line x1="35" y1="54" x2="54" y2="54" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
            <Line x1="66" y1="54" x2="85" y2="54" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
            <Path d="M47 75 Q60 70 73 75" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
            <Path d="M42 42 Q44 35 50 38" stroke="#1B3022" strokeWidth="3" strokeLinecap="round" />
            <Path d="M78 42 Q76 35 70 38" stroke="#1B3022" strokeWidth="3" strokeLinecap="round" />
          </Svg>
        ),
      },
      {
        id: 'v1',
        label: 'Moon & Zzz',
        icon: (s) => (
          <Svg key="dr-v1" width={s} height={s} viewBox="0 0 120 120">
            <Path d="M52 35 C40 40,32 55,35 70 C38 85,52 93,66 89 C50 96,30 84,26 65 C22 46,36 28,54 25 C58 24,56 31,52 35Z" fill="#6B7FD7" stroke="#4A5DA8" strokeWidth="3" />
            <Path d="M78 48 L90 48 L78 62 L90 62" stroke="#6B7FD7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M85 28 L94 28 L85 38 L94 38" stroke="#6B7FD7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M90 12 L97 12 L90 20 L97 20" stroke="#6B7FD7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ),
      },
      {
        id: 'v2',
        label: 'Heavy eyelids',
        icon: (s) => (
          <Svg key="dr-v2" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="62" r="35" fill="#FFCCBC" stroke="#FF8A65" strokeWidth="4" />
            <Path d="M36 55 Q44 64 53 55" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
            <Path d="M67 55 Q76 64 85 55" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
            <Circle cx="44" cy="58" r="3" fill="#1B3022" />
            <Circle cx="76" cy="58" r="3" fill="#1B3022" />
            <Path d="M48 80 Q60 74 72 80" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
            <Path d="M78 32 L86 32 L78 40 L86 40" stroke="#6B7FD7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ),
      },
    ],
  },
  {
    id: 'side_effects_may_cause_dizziness',
    label: 'May Cause Dizziness',
    variants: [
      {
        id: 'v0',
        label: 'Dizzy face',
        icon: (s) => (
          <Svg key="dz-v0" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="35" fill="#FFE082" stroke="#FFA726" strokeWidth="4" />
            <Circle cx="48" cy="54" r="5" fill="#1B3022" />
            <Circle cx="72" cy="54" r="5" fill="#1B3022" />
            <Path d="M45 75 Q60 68 75 75" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
            <Path d="M28 28 L38 38 M48 23 L48 33 M72 23 L72 33 M82 28 L92 38" stroke="#FFA726" strokeWidth="3" strokeLinecap="round" />
          </Svg>
        ),
      },
    ],
  },
  {
    id: 'side_effects_avoid_driving',
    label: 'Avoid Driving',
    variants: [
      {
        id: 'v0',
        label: 'Checkmark placeholder',
        icon: (s) => (
          <Svg key="no-v0" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="35" stroke="#1B3022" strokeWidth="5" fill="none" />
            <Path d="M44 60 L55 71 L76 49" stroke="#1B3022" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ),
      },
    ],
  },
  {
    id: 'side_effects_may_cause_nausea',
    label: 'May Cause Nausea',
    variants: [
      {
        id: 'v0',
        label: 'Sick face',
        icon: (s) => (
          <Svg key="na-v0" width={s} height={s} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="35" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="4" />
            <Circle cx="48" cy="53" r="4" fill="#1B3022" />
            <Circle cx="72" cy="53" r="4" fill="#1B3022" />
            <Path d="M45 72 Q60 80 75 72" stroke="#1B3022" strokeWidth="4" strokeLinecap="round" />
          </Svg>
        ),
      },
    ],
  },
  { id: 'side_effects_may_cause_headache', label: 'May Cause Headache', variants: [makePlaceholderVariant('May Cause Headache')] },
  { id: 'side_effects_may_cause_blurred_vision', label: 'May Cause Blurred Vision', variants: [makePlaceholderVariant('May Cause Blurred Vision')] },
  { id: 'side_effects_may_cause_tremors', label: 'May Cause Tremors', variants: [makePlaceholderVariant('May Cause Tremors')] },
  { id: 'side_effects_may_cause_vomiting', label: 'May Cause Vomiting', variants: [makePlaceholderVariant('May Cause Vomiting')] },
  { id: 'side_effects_may_cause_diarrhea', label: 'May Cause Diarrhea', variants: [makePlaceholderVariant('May Cause Diarrhea')] },
  { id: 'side_effects_may_cause_constipation', label: 'May Cause Constipation', variants: [makePlaceholderVariant('May Cause Constipation')] },
  { id: 'side_effects_may_cause_dry_mouth', label: 'May Cause Dry Mouth', variants: [makePlaceholderVariant('May Cause Dry Mouth')] },
  { id: 'side_effects_may_cause_light_sensitivity', label: 'May Cause Light Sensitivity', variants: [makePlaceholderVariant('May Cause Light Sensitivity')] },
  { id: 'side_effects_may_cause_allergic_reaction', label: 'May Cause Allergic Reaction', variants: [makePlaceholderVariant('May Cause Allergic Reaction')] },
  { id: 'side_effects_may_cause_muscle_weakness', label: 'May Cause Muscle Weakness', variants: [makePlaceholderVariant('May Cause Muscle Weakness')] },
  { id: 'side_effects_may_cause_fast_heartbeat', label: 'May Cause Fast Heartbeat', variants: [makePlaceholderVariant('May Cause Fast Heartbeat')] },
  { id: 'side_effects_may_cause_fever', label: 'May Cause Fever', variants: [makePlaceholderVariant('May Cause Fever')] },
  { id: 'side_effects_increased_fall_risk', label: 'Increased Fall Risk', variants: [makePlaceholderVariant('Increased Fall Risk')] },
];

// ─── DURATION ────────────────────────────────────────────────────────────────

export const DURATION_OPTIONS: PictogramOption[] = [
  { id: 'duration_1_day', label: 'Take for 1 Day', variants: [makePlaceholderVariant('Take for 1 Day')] },
  { id: 'duration_2_days', label: 'Take for 2 Days', variants: [makePlaceholderVariant('Take for 2 Days')] },
  { id: 'duration_3_days', label: 'Take for 3 Days', variants: [makePlaceholderVariant('Take for 3 Days')] },
  { id: 'duration_4_days', label: 'Take for 4 Days', variants: [makePlaceholderVariant('Take for 4 Days')] },
  { id: 'duration_5_days', label: 'Take for 5 Days', variants: [makePlaceholderVariant('Take for 5 Days')] },
  { id: 'duration_6_days', label: 'Take for 6 Days', variants: [makePlaceholderVariant('Take for 6 Days')] },
  { id: 'duration_7_days', label: 'Take for 7 Days', variants: [makePlaceholderVariant('Take for 7 Days')] },
  { id: 'duration_8_days', label: 'Take for 8 Days', variants: [makePlaceholderVariant('Take for 8 Days')] },
  { id: 'duration_9_days', label: 'Take for 9 Days', variants: [makePlaceholderVariant('Take for 9 Days')] },
  { id: 'duration_10_days', label: 'Take for 10 Days', variants: [makePlaceholderVariant('Take for 10 Days')] },
  { id: 'duration_1_week', label: 'Take for 1 Week', variants: [makePlaceholderVariant('Take for 1 Week')] },
  { id: 'duration_2_weeks', label: 'Take for 2 Weeks', variants: [makePlaceholderVariant('Take for 2 Weeks')] },
  { id: 'duration_3_weeks', label: 'Take for 3 Weeks', variants: [makePlaceholderVariant('Take for 3 Weeks')] },
  { id: 'duration_4_weeks', label: 'Take for 4 Weeks', variants: [makePlaceholderVariant('Take for 4 Weeks')] },
  { id: 'duration_5_weeks', label: 'Take for 5 Weeks', variants: [makePlaceholderVariant('Take for 5 Weeks')] },
  { id: 'duration_6_weeks', label: 'Take for 6 Weeks', variants: [makePlaceholderVariant('Take for 6 Weeks')] },
  { id: 'duration_7_weeks', label: 'Take for 7 Weeks', variants: [makePlaceholderVariant('Take for 7 Weeks')] },
  { id: 'duration_8_weeks', label: 'Take for 8 Weeks', variants: [makePlaceholderVariant('Take for 8 Weeks')] },
  { id: 'duration_9_weeks', label: 'Take for 9 Weeks', variants: [makePlaceholderVariant('Take for 9 Weeks')] },
  { id: 'duration_10_weeks', label: 'Take for 10 Weeks', variants: [makePlaceholderVariant('Take for 10 Weeks')] },
  { id: 'duration_1_month', label: 'Take for 1 Month', variants: [makePlaceholderVariant('Take for 1 Month')] },
  { id: 'duration_2_months', label: 'Take for 2 Months', variants: [makePlaceholderVariant('Take for 2 Months')] },
  { id: 'duration_3_months', label: 'Take for 3 Months', variants: [makePlaceholderVariant('Take for 3 Months')] },
  { id: 'duration_4_months', label: 'Take for 4 Months', variants: [makePlaceholderVariant('Take for 4 Months')] },
  { id: 'duration_5_months', label: 'Take for 5 Months', variants: [makePlaceholderVariant('Take for 5 Months')] },
  { id: 'duration_6_months', label: 'Take for 6 Months', variants: [makePlaceholderVariant('Take for 6 Months')] },
  { id: 'duration_7_months', label: 'Take for 7 Months', variants: [makePlaceholderVariant('Take for 7 Months')] },
  { id: 'duration_8_months', label: 'Take for 8 Months', variants: [makePlaceholderVariant('Take for 8 Months')] },
  { id: 'duration_9_months', label: 'Take for 9 Months', variants: [makePlaceholderVariant('Take for 9 Months')] },
  { id: 'duration_10_months', label: 'Take for 10 Months', variants: [makePlaceholderVariant('Take for 10 Months')] },
  { id: 'duration_11_months', label: 'Take for 11 Months', variants: [makePlaceholderVariant('Take for 11 Months')] },
  { id: 'duration_12_months', label: 'Take for 12 Months', variants: [makePlaceholderVariant('Take for 12 Months')] },
  { id: 'duration_complete_course', label: 'Complete Course', variants: [makePlaceholderVariant('Complete Course')] },
  { id: 'duration_stop_on_doctors_advice', label: "Stop on Doctor's Advice", variants: [makePlaceholderVariant("Stop on Doctor's Advice")] },
  { id: 'duration_take_until_symptoms_resolve', label: 'Take Until Symptoms Resolve', variants: [makePlaceholderVariant('Until Symptoms Resolve')] },
  { id: 'duration_repeat_cycle', label: 'Repeat Cycle', variants: [makePlaceholderVariant('Repeat Cycle')] },
];

// ─── DOSAGE ──────────────────────────────────────────────────────────────────

export const DOSAGE_OPTIONS: PictogramOption[] = [
  { id: 'dosage_half_tablet', label: 'Half Tablet', variants: [makePlaceholderVariant('Half Tablet')] },
  { id: 'dosage_1_tablet', label: '1 Tablet', variants: [makePlaceholderVariant('1 Tablet')] },
  { id: 'dosage_1_and_half_tablets', label: '1½ Tablets', variants: [makePlaceholderVariant('1.5 Tablets')] },
  { id: 'dosage_2_tablets', label: '2 Tablets', variants: [makePlaceholderVariant('2 Tablets')] },
  { id: 'dosage_2_and_half_tablets', label: '2½ Tablets', variants: [makePlaceholderVariant('2.5 Tablets')] },
  { id: 'dosage_3_tablets', label: '3 Tablets', variants: [makePlaceholderVariant('3 Tablets')] },
  { id: 'dosage_3_and_half_tablets', label: '3½ Tablets', variants: [makePlaceholderVariant('3.5 Tablets')] },
  { id: 'dosage_4_tablets', label: '4 Tablets', variants: [makePlaceholderVariant('4 Tablets')] },
  { id: 'dosage_4_and_half_tablets', label: '4½ Tablets', variants: [makePlaceholderVariant('4.5 Tablets')] },
  { id: 'dosage_1_teaspoon', label: '1 Teaspoon', variants: [makePlaceholderVariant('1 Teaspoon')] },
  { id: 'dosage_2_teaspoons', label: '2 Teaspoons', variants: [makePlaceholderVariant('2 Teaspoons')] },
  { id: 'dosage_3_teaspoons', label: '3 Teaspoons', variants: [makePlaceholderVariant('3 Teaspoons')] },
  { id: 'dosage_1_tablespoon', label: '1 Tablespoon', variants: [makePlaceholderVariant('1 Tablespoon')] },
  { id: 'dosage_2_tablespoons', label: '2 Tablespoons', variants: [makePlaceholderVariant('2 Tablespoons')] },
  { id: 'dosage_3_tablespoons', label: '3 Tablespoons', variants: [makePlaceholderVariant('3 Tablespoons')] },
  { id: 'dosage_1_ear_drop', label: '1 Ear Drop', variants: [makePlaceholderVariant('1 Ear Drop')] },
  { id: 'dosage_2_ear_drops', label: '2 Ear Drops', variants: [makePlaceholderVariant('2 Ear Drops')] },
  { id: 'dosage_3_ear_drops', label: '3 Ear Drops', variants: [makePlaceholderVariant('3 Ear Drops')] },
  { id: 'dosage_4_ear_drops', label: '4 Ear Drops', variants: [makePlaceholderVariant('4 Ear Drops')] },
  { id: 'dosage_1_eye_drop', label: '1 Eye Drop', variants: [makePlaceholderVariant('1 Eye Drop')] },
  { id: 'dosage_2_eye_drops', label: '2 Eye Drops', variants: [makePlaceholderVariant('2 Eye Drops')] },
  { id: 'dosage_3_eye_drops', label: '3 Eye Drops', variants: [makePlaceholderVariant('3 Eye Drops')] },
  { id: 'dosage_4_eye_drops', label: '4 Eye Drops', variants: [makePlaceholderVariant('4 Eye Drops')] },
  { id: 'dosage_injection_5ml', label: '5ml Injection', variants: [makePlaceholderVariant('5ml Injection')] },
  { id: 'dosage_injection_10ml', label: '10ml Injection', variants: [makePlaceholderVariant('10ml Injection')] },
  { id: 'dosage_injection_15ml', label: '15ml Injection', variants: [makePlaceholderVariant('15ml Injection')] },
  { id: 'dosage_injection_20ml', label: '20ml Injection', variants: [makePlaceholderVariant('20ml Injection')] },
];

// ─── PRECAUTIONS ─────────────────────────────────────────────────────────────

export const PRECAUTIONS_OPTIONS: PictogramOption[] = [
  { id: 'precautions_avoid_alcohol', label: 'Avoid Alcohol', variants: [makePlaceholderVariant('Avoid Alcohol')] },
  { id: 'precautions_avoid_dairy', label: 'Avoid Dairy', variants: [makePlaceholderVariant('Avoid Dairy')] },
  { id: 'precautions_avoid_grapefruit', label: 'Avoid Grapefruit', variants: [makePlaceholderVariant('Avoid Grapefruit')] },
  { id: 'precautions_keep_refrigerated', label: 'Keep Refrigerated', variants: [makePlaceholderVariant('Keep Refrigerated')] },
  { id: 'precautions_keep_refrigerated_do_not_freeze', label: 'Keep Refrigerated, Do Not Freeze', variants: [makePlaceholderVariant('Do Not Freeze')] },
  { id: 'precautions_keep_away_from_light', label: 'Keep Away From Light', variants: [makePlaceholderVariant('Keep Away From Light')] },
  { id: 'precautions_keep_away_from_children', label: 'Keep Away From Children', variants: [makePlaceholderVariant('Keep Away From Children')] },
  { id: 'precautions_keep_away_from_pets', label: 'Keep Away From Pets', variants: [makePlaceholderVariant('Keep Away From Pets')] },
  { id: 'precautions_dispose_properly', label: 'Dispose Properly', variants: [makePlaceholderVariant('Dispose Properly')] },
  { id: 'precautions_do_not_share', label: 'Do Not Share', variants: [makePlaceholderVariant('Do Not Share')] },
  { id: 'precautions_do_not_take_if_pregnant', label: 'Do Not Take if Pregnant', variants: [makePlaceholderVariant('Do Not Take if Pregnant')] },
  { id: 'precautions_do_not_take_if_breastfeeding', label: 'Do Not Take if Breastfeeding', variants: [makePlaceholderVariant('Do Not if Breastfeeding')] },
  { id: 'precautions_consult_doctor_before_taking', label: 'Consult Doctor Before Taking', variants: [makePlaceholderVariant('Consult Doctor')] },
  { id: 'precautions_consult_doctor_if_symptoms_worsen', label: 'Consult Doctor if Symptoms Worsen', variants: [makePlaceholderVariant('Consult if Worsen')] },
  { id: 'precautions_check_expiry_date', label: 'Check Expiry Date', variants: [makePlaceholderVariant('Check Expiry')] },
  { id: 'precautions_discard_8_weeks_after_opening', label: 'Discard 8 Weeks After Opening', variants: [makePlaceholderVariant('Discard after 8 Weeks')] },
  { id: 'precautions_store_in_cool_dry_place', label: 'Store in Cool Dry Place', variants: [makePlaceholderVariant('Store Cool & Dry')] },
];
