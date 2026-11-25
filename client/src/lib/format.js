export const money = (n, currency = 'PKR') =>
  `${currency} ${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const date = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const dateTime = (d) =>
  new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const initials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const daysAgo = (n, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d.toISOString();
};

export const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
