const person = {
  name: 'sam',
  age: 18,
  gender: 'male'
};

const resolvers = {
  Query: {
    person: () => person
  }
};

export default resolvers;
