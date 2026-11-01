import { FlatList, useWindowDimensions } from 'react-native';
import type { CreditCard } from '../types';
import { CreditCardSummary } from './CreditCardSummary';

export function CreditCardCarousel({
  cards,
  onOpen,
  onPurchase,
}: {
  cards: CreditCard[];
  onOpen: (card: CreditCard) => void;
  onPurchase?: (card: CreditCard) => void;
}) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(280, width - 48);
  return (
    <FlatList
      horizontal
      data={cards}
      keyExtractor={(card) => card.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + 12}
      decelerationRate="fast"
      disableIntervalMomentum
      contentContainerStyle={{ paddingRight: 12, alignItems: 'flex-start' }}
      renderItem={({ item }) => (
        <CreditCardSummary
          card={item}
          compact
          style={{ width: cardWidth, marginRight: 12 }}
          onPress={() => onOpen(item)}
          onPurchase={onPurchase ? () => onPurchase(item) : undefined}
        />
      )}
    />
  );
}
