import { Image } from 'react-native';

interface TripUpLogoProps {
  size?: number;
}

/**
 * TripUp Logo Component
 * Uses PNG image for clean, professional appearance
 */
export function TripUpLogo({ size = 120 }: TripUpLogoProps) {
  return (
    <Image
      source={require('@/assets/images/tripuplogo.png')}
      style={{
        width: size,
        height: size,
        resizeMode: 'contain',
      }}
    />
  );
}

export default TripUpLogo;
