// Onboarding screen component

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch } from '../store';
import { completeOnboarding, setFirstLaunch } from '../store/slices/authSlice';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: any; // You can replace with actual images
  backgroundColor: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to Harsha Delights',
    subtitle: 'Premium Confectionery',
    description: 'Discover our exquisite collection of handcrafted sweets, chocolates, and delicious treats made with love and finest ingredients.',
    image: require('../assets/images/onboarding-1.png'), // Add actual images
    backgroundColor: COLORS.primary,
  },
  {
    id: '2',
    title: 'Fresh & Premium Quality',
    subtitle: 'Always Fresh, Always Delicious',
    description: 'We ensure every product is made fresh daily using premium ingredients sourced from trusted suppliers across the globe.',
    image: require('../assets/images/onboarding-2.png'), // Add actual images
    backgroundColor: COLORS.secondary,
  },
  {
    id: '3',
    title: 'Quick & Easy Ordering',
    subtitle: 'Order in Minutes',
    description: 'Browse, select, and order your favorite sweets with just a few taps. Fast delivery right to your doorstep.',
    image: require('../assets/images/onboarding-3.png'), // Add actual images
    backgroundColor: COLORS.accent,
  },
  {
    id: '4',
    title: 'Fast Delivery',
    subtitle: 'Sweet Moments, Delivered',
    description: 'Get your favorite treats delivered fresh and fast. Track your order in real-time and enjoy sweet moments with your loved ones.',
    image: require('../assets/images/onboarding-4.png'), // Add actual images
    backgroundColor: COLORS.success,
  },
];

const OnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    dispatch(setFirstLaunch(false));
    dispatch(completeOnboarding());
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.imageContainer}>
          {/* Placeholder for image - replace with actual Image component */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📱</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex ? COLORS.white : 'rgba(255, 255, 255, 0.5)',
                width: index === currentIndex ? 30 : 10,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={onboardingData[currentIndex].backgroundColor}
      />

      {/* Skip button */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEnabled={false} // Disable manual scrolling to control navigation
      />

      {/* Bottom section */}
      <View style={[styles.bottomContainer, { backgroundColor: onboardingData[currentIndex].backgroundColor }]}>
        {renderPagination()}

        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Text style={styles.previousText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={[COLORS.white, 'rgba(255, 255, 255, 0.9)']}
              style={styles.nextButtonGradient}>
              <Text style={[styles.nextText, { color: onboardingData[currentIndex].backgroundColor }]}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.lg,
    zIndex: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.white,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 80,
  },
  contentContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingBottom: 100, // Space for bottom buttons
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
    opacity: 0.9,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  previousText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.white,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  nextText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
  },
});

export default OnboardingScreen;