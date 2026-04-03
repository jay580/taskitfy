export const formatPoints = (points: number) => {
  return `⭐ ${points}`;
};

export const formatDate = (date: any) => {
  return new Date(date).toLocaleDateString();
};