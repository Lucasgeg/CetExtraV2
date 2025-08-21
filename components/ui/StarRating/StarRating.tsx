// Créez un composant StarRating réutilisable
import { StarIcon } from "@heroicons/react/24/outline";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: string;
  showEmpty?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = "h-4 w-4",
  showEmpty = true
}) => {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= rating;
    const isEmpty = rating === 0 && showEmpty;

    stars.push(
      <StarIcon
        key={i}
        className={`inline-block ${size} ${
          isEmpty
            ? "text-gray-300"
            : isFilled
              ? "fill-yellow-300 text-yellow-400"
              : "text-gray-300"
        }`}
      />
    );
  }

  return <>{stars}</>;
};

// Créez un helper pour générer la légende
export const getExperienceItems = () => [
  {
    label: <StarRating rating={0} maxStars={1} />,
    value: "Pas d'expérience"
  },
  {
    label: <StarRating rating={1} maxStars={1} />,
    value: "1 an d'expérience"
  },
  {
    label: <StarRating rating={2} maxStars={2} />,
    value: "2 ans d'expérience"
  },
  {
    label: <StarRating rating={3} maxStars={3} />,
    value: "3 ans d'expérience"
  },
  {
    label: <StarRating rating={4} maxStars={4} />,
    value: "4 ans d'expérience"
  },
  {
    label: <StarRating rating={5} maxStars={5} />,
    value: "5 ans d'expérience ou plus"
  }
];
