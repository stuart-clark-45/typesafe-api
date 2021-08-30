export interface Dog {
  name: string;
  breed: string;
}

export interface DogWithId extends Dog {
  _id: string;
}

export const scoobyDoo: Dog = {
  name: 'Scooby Doo',
  breed: 'Great Dane',
};

// Set up a dummy database
export let dogDB: Map<string, DogWithId>;
export const clearDogDB = (): void => {
  dogDB = new Map<string, DogWithId>();
};
clearDogDB();
