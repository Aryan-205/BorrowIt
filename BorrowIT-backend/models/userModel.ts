import { countUserRentals } from "./rentalModel.js";

export function getCurrentUserProfile(userId: string) {
  return {
    id: userId,
    karmaScore: 5,
    karmaCount: 3,
    rentalCount: countUserRentals(userId),
    isVerified: true,
  };
}
