import { Star, Users, Bed, Bath } from "lucide-react";

import { ListingCardProps } from "src/types";

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const {
    address,
    image,
    numOfBaths,
    numOfBeds,
    numOfGuests,
    price,
    rating,
    title,
  } = listing;
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <img
        className="w-full h-48 object-cover"
        height={200}
        width={200}
        src={image}
        alt={title}
      />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 text-gray-800">{title}</div>
        <p className="text-gray-600 text-sm mb-2">{address}</p>
        <div className="flex items-center mb-2">
          <Star className="h-5 w-5 text-yellow-400 mr-1" />
          <span className="text-gray-700">{rating}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-700">
            <Users className="h-5 w-5 mr-1" />
            <span>{numOfGuests} guests</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Bed className="h-5 w-5 mr-1" />
            <span>{numOfBeds} beds</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Bath className="h-5 w-5 mr-1" />
            <span>{numOfBaths} baths</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-bold text-xl">${price}</span>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
