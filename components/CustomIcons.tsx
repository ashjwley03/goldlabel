import React from 'react';
import Svg, { Circle, Path, Rect, Ellipse } from 'react-native-svg';

interface IconProps {
  size?: number;
}

export function MorningIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="22" fill="#FDB63F" stroke="#FDB63F" strokeWidth="6" />
      <Path d="M60 15 L60 25" stroke="#FDB63F" strokeWidth="7" strokeLinecap="round" />
      <Path d="M60 95 L60 105" stroke="#FDB63F" strokeWidth="7" strokeLinecap="round" />
      <Path d="M15 60 L25 60" stroke="#FDB63F" strokeWidth="7" strokeLinecap="round" />
      <Path d="M95 60 L105 60" stroke="#FDB63F" strokeWidth="7" strokeLinecap="round" />
      <Path d="M28 28 L35 35" stroke="#FDB63F" strokeWidth="7" strokeLinecap="round" />
      <Path d="M85 85 L92 92" stroke="#FDB63F" strokeWidth="7" strokeLinecap="round" />
      <Path d="M28 92 L35 85" stroke="#FDB63F" strokeWidth="7" strokeLinecap="round" />
      <Path d="M85 35 L92 28" stroke="#FDB63F" strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

export function NoonIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx="60" cy="45" r="20" fill="#FF9B54" stroke="#FF9B54" strokeWidth="6" />
      <Circle cx="60" cy="45" r="28" fill="#FF9B54" fillOpacity="0.2" />
      <Path d="M60 10 L60 20" stroke="#FF9B54" strokeWidth="7" strokeLinecap="round" />
      <Path d="M60 70 L60 80" stroke="#FF9B54" strokeWidth="7" strokeLinecap="round" />
      <Path d="M25 45 L35 45" stroke="#FF9B54" strokeWidth="7" strokeLinecap="round" />
      <Path d="M85 45 L95 45" stroke="#FF9B54" strokeWidth="7" strokeLinecap="round" />
      <Path d="M35 20 L42 27" stroke="#FF9B54" strokeWidth="7" strokeLinecap="round" />
      <Path d="M78 63 L85 70" stroke="#FF9B54" strokeWidth="7" strokeLinecap="round" />
      <Path d="M10 95 L110 95" stroke="#1B3022" strokeWidth="5" strokeLinecap="round" opacity="0.3" />
    </Svg>
  );
}

export function NightIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path
        d="M70 25 C70 45, 50 60, 50 80 C50 60, 70 45, 90 45 C80 35, 75 25, 70 25 Z"
        fill="#6B7FD7"
        stroke="#6B7FD7"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <Circle cx="30" cy="35" r="3" fill="#6B7FD7" />
      <Circle cx="45" cy="25" r="2.5" fill="#6B7FD7" />
      <Circle cx="85" cy="70" r="3" fill="#6B7FD7" />
      <Circle cx="95" cy="55" r="2" fill="#6B7FD7" />
      <Circle cx="35" cy="70" r="2.5" fill="#6B7FD7" />
    </Svg>
  );
}

export function PillIcon({ size = 140 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 140 140">
      <Rect x="30" y="45" width="80" height="50" rx="25" fill="#1B3022" stroke="#1B3022" strokeWidth="7" />
      <Path d="M70 45 L70 95" stroke="#F5F2ED" strokeWidth="6" strokeLinecap="round" />
      <Circle cx="50" cy="70" r="4" fill="#F5F2ED" />
      <Circle cx="90" cy="70" r="4" fill="#F5F2ED" />
    </Svg>
  );
}

export function FoodIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx="60" cy="65" r="35" fill="none" stroke="#2D5F3F" strokeWidth="7" />
      <Ellipse cx="60" cy="65" rx="35" ry="8" fill="#2D5F3F" fillOpacity="0.2" />
      <Path d="M35 30 L35 55" stroke="#2D5F3F" strokeWidth="6" strokeLinecap="round" />
      <Path d="M30 30 L30 45" stroke="#2D5F3F" strokeWidth="5" strokeLinecap="round" />
      <Path d="M40 30 L40 45" stroke="#2D5F3F" strokeWidth="5" strokeLinecap="round" />
      <Path d="M85 30 L85 55" stroke="#2D5F3F" strokeWidth="7" strokeLinecap="round" />
      <Path d="M80 30 L90 30 L85 25 Z" fill="#2D5F3F" />
    </Svg>
  );
}

export function NoFoodIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="35" fill="none" stroke="#D37B5C" strokeWidth="7" opacity="0.4" />
      <Path d="M35 35 L85 85" stroke="#D37B5C" strokeWidth="10" strokeLinecap="round" />
      <Path d="M85 35 L35 85" stroke="#D37B5C" strokeWidth="10" strokeLinecap="round" />
    </Svg>
  );
}
