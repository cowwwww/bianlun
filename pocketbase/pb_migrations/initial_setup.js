// PocketBase migration to create initial collections
migrate((db) => {
  // Create tournaments collection
  const tournamentsCollection = new Collection({
    name: 'tournaments',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'title', type: 'text', required: false },
      { name: 'description', type: 'text', required: false },
      { name: 'startDate', type: 'text', required: false },
      { name: 'endDate', type: 'text', required: false },
      { name: 'registrationDeadline', type: 'text', required: false },
      { name: 'location', type: 'text', required: false },
      { name: 'type', type: 'text', required: false },
      { name: 'status', type: 'text', required: false },
      { name: 'price', type: 'number', required: false },
      { name: 'organizer', type: 'text', required: false },
      { name: 'contact', type: 'text', required: false },
      { name: 'category', type: 'text', required: false },
    ]
  });
  
  db.save(tournamentsCollection);

  // Create topics collection
  const topicsCollection = new Collection({
    name: 'topics',
    type: 'base',
    schema: [
      { name: 'text', type: 'text', required: true },
      { name: 'explanation', type: 'text', required: false },
      { name: 'area', type: 'text', required: false },
      { name: 'language', type: 'text', required: false },
      { name: 'tournament', type: 'text', required: false },
    ]
  });
  
  db.save(topicsCollection);
}, (db) => {
  // Rollback
  db.deleteCollection('tournaments');
  db.deleteCollection('topics');
});

