require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { Member, Sprint, Story, Risk } = require('./models');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Member, Sprint, Story, Risk].map((M) => M.deleteMany({})));

  await User.create({ name: 'Project Manager', email: 'pm@scrumflow.app', password: 'admin123', role: 'admin' });
  const [ali, zara] = await Member.insertMany([
    { name: 'Ali Raza', role: 'Frontend', capacity: 13 },
    { name: 'Zara Malik', role: 'Backend', capacity: 13 },
    { name: 'Omar Shah', role: 'Mobile', capacity: 10 },
  ]);
  const sprint = await Sprint.create({ name: 'Sprint 1', goal: 'Users can sign up and log in', status: 'planned' });
  for (const s of [
    { title: 'User registration with email', points: 5, assignee: zara._id, sprint: sprint._id, acceptanceCriteria: ['Valid email required', 'Password min 8 chars'] },
    { title: 'Login screen UI', points: 3, assignee: ali._id, sprint: sprint._id },
    { title: 'Push notification service', points: 8 },
  ]) {
    // eslint-disable-next-line no-await-in-loop
    await Story.create(s);
  }
  await Risk.create({ title: 'App Store review delay', category: 'Schedule', probability: 3, impact: 4, owner: 'PM', mitigation: 'Submit 5 days before launch' });

  console.log('Seeded. Login: pm@scrumflow.app / admin123');
  await mongoose.disconnect();
})();
