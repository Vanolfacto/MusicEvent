import {
  PrismaClient,
  UserRole,
  ArtistType,
  EventType,
  EventStatus,
  ApplicationType,
  ApplicationStatus,
  PerformanceStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const DEMO_PASSWORDS = {
  admin: 'DemoAdmin123!',
  organizer: 'DemoOrg123!',
  artist: 'DemoArtist123!',
} as const;

const CITIES = ['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Zrenjanin'];
const GENRES = [
  'Rock',
  'Pop',
  'Jazz',
  'Electronic',
  'Folk',
  'Metal',
  'Hip Hop',
  'Classical',
  'Blues',
  'Country',
  'Reggae',
  'R&B',
];
const EVENT_TYPES: EventType[] = [
  'CONCERT',
  'FESTIVAL',
  'PRIVATE_PARTY',
  'WEDDING',
  'CORPORATE',
  'CLUB_NIGHT',
  'OTHER',
];
const ARTIST_TYPES: ArtistType[] = ['SOLO', 'BAND', 'DJ'];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickMany<T>(arr: T[], count: number, rand: () => number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(rand() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

async function hash(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('Brisanje postojećih podataka...');
  await prisma.refreshToken.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.performance.deleteMany();
  await prisma.application.deleteMany();
  await prisma.eventGenre.deleteMany();
  await prisma.artistGenre.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.event.deleteMany();
  await prisma.modelTrainingRun.deleteMany();
  await prisma.artistProfile.deleteMany();
  await prisma.organizerProfile.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  const rand = seededRandom(42);

  console.log('Kreiranje žanrova...');
  const genres = await Promise.all(
    GENRES.map((name) => prisma.genre.create({ data: { name } })),
  );

  console.log('Kreiranje administratora...');
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Korisnik',
      email: 'admin@demo.local',
      passwordHash: await hash(DEMO_PASSWORDS.admin),
      role: UserRole.ADMIN,
    },
  });

  console.log('Kreiranje organizatora...');
  const organizers = [];
  for (let i = 1; i <= 6; i++) {
    const user = await prisma.user.create({
      data: {
        firstName: `Organizator${i}`,
        lastName: 'Demo',
        email: `organizer${i}@demo.local`,
        passwordHash: await hash(DEMO_PASSWORDS.organizer),
        role: UserRole.ORGANIZER,
      },
    });
    const profile = await prisma.organizerProfile.create({
      data: {
        userId: user.id,
        organizationName: `Muzička agencija ${i}`,
        description: `Profesionalna organizacija muzičkih događaja u gradu ${pick(CITIES, rand)}.`,
        city: pick(CITIES, rand),
        phone: `+381 6${Math.floor(rand() * 9000000 + 1000000)}`,
      },
    });
    organizers.push({ user, profile });
  }

  console.log('Kreiranje izvođača...');
  const artists = [];
  for (let i = 1; i <= 55; i++) {
    const artistType = pick(ARTIST_TYPES, rand);
    const city = pick(CITIES, rand);
    const minFee = Math.floor(rand() * 400 + 100);
    const maxFee = minFee + Math.floor(rand() * 1500 + 200);

    const user = await prisma.user.create({
      data: {
        firstName: `Izvođač${i}`,
        lastName: 'Demo',
        email: `artist${i}@demo.local`,
        passwordHash: await hash(DEMO_PASSWORDS.artist),
        role: UserRole.ARTIST,
      },
    });

    const profile = await prisma.artistProfile.create({
      data: {
        userId: user.id,
        stageName: `${artistType === 'BAND' ? 'Bend' : artistType === 'DJ' ? 'DJ' : 'Solo'} ${i}`,
        biography: `Iskusni ${artistType.toLowerCase()} izvođač sa fokusom na lokalnu scenu.`,
        city,
        artistType,
        memberCount: artistType === 'BAND' ? Math.floor(rand() * 4 + 2) : 1,
        minimumFee: minFee,
        maximumFee: maxFee,
        averageRating: Number((rand() * 2 + 3).toFixed(2)),
        totalPerformances: Math.floor(rand() * 80),
        yearsOfExperience: Math.floor(rand() * 20 + 1),
        spotifyUrl: rand() > 0.3 ? `https://open.spotify.com/artist/demo${i}` : null,
        youtubeUrl: rand() > 0.4 ? `https://youtube.com/@artist${i}` : null,
        instagramUrl: rand() > 0.2 ? `https://instagram.com/artist${i}` : null,
        isAvailable: rand() > 0.15,
      },
    });

    const artistGenres = pickMany(genres, Math.floor(rand() * 3 + 1), rand);
    await Promise.all(
      artistGenres.map((genre) =>
        prisma.artistGenre.create({
          data: { artistId: profile.id, genreId: genre.id },
        }),
      ),
    );

    artists.push({ user, profile, genres: artistGenres });
  }

  console.log('Kreiranje događaja...');
  const events = [];
  const now = new Date();

  for (let i = 1; i <= 35; i++) {
    const organizer = pick(organizers, rand);
    const daysAhead = Math.floor(rand() * 120 + 5);
    const start = new Date(now);
    start.setDate(start.getDate() + daysAhead);
    start.setHours(Math.floor(rand() * 6 + 17), 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + Math.floor(rand() * 4 + 2));

    const minBudget = Math.floor(rand() * 2000 + 500);
    const maxBudget = minBudget + Math.floor(rand() * 5000 + 1000);

    const event = await prisma.event.create({
      data: {
        organizerId: organizer.profile.id,
        title: `Muzički događaj ${i}`,
        description: `Događaj organizovan od strane ${organizer.profile.organizationName}.`,
        eventType: pick(EVENT_TYPES, rand),
        city: pick(CITIES, rand),
        venue: `Dvorana ${i}`,
        address: `Ulica ${i}, ${pick(CITIES, rand)}`,
        startDateTime: start,
        endDateTime: end,
        expectedAudience: Math.floor(rand() * 900 + 100),
        minimumBudget: minBudget,
        maximumBudget: maxBudget,
        preferredArtistType: pick(ARTIST_TYPES, rand),
        status:
          rand() > 0.7
            ? EventStatus.COMPLETED
            : rand() > 0.4
              ? EventStatus.PUBLISHED
              : EventStatus.DRAFT,
      },
    });

    const eventGenres = pickMany(genres, Math.floor(rand() * 2 + 1), rand);
    await Promise.all(
      eventGenres.map((genre) =>
        prisma.eventGenre.create({
          data: { eventId: event.id, genreId: genre.id },
        }),
      ),
    );

    events.push({ event, genres: eventGenres, organizer });
  }

  console.log('Kreiranje prijava i poziva...');
  const applications = [];
  for (let i = 0; i < 80; i++) {
    const eventData = pick(events, rand);
    const artistData = pick(artists, rand);
    const applicationType = rand() > 0.6 ? ApplicationType.INVITE : ApplicationType.APPLY;
    const statusPool =
      eventData.event.status === EventStatus.COMPLETED
        ? [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED]
        : [ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED];
    const status = pick(statusPool, rand);

    try {
      const application = await prisma.application.create({
        data: {
          eventId: eventData.event.id,
          artistId: artistData.profile.id,
          applicationType,
          status,
          message:
            applicationType === ApplicationType.APPLY
              ? 'Zainteresovan sam za nastup na ovom događaju.'
              : 'Pozivamo vas da nastupite na našem događaju.',
        },
      });
      applications.push(application);
    } catch {
      // unique constraint — skip duplicates
    }
  }

  console.log('Kreiranje nastupa...');
  const acceptedApplications = await prisma.application.findMany({
    where: { status: ApplicationStatus.ACCEPTED },
    include: { event: true, artist: true },
    take: 40,
  });

  for (const app of acceptedApplications) {
    const perfStart = new Date(app.event.startDateTime);
    perfStart.setMinutes(perfStart.getMinutes() + Math.floor(rand() * 60));
    const perfEnd = new Date(perfStart);
    perfEnd.setHours(perfStart.getHours() + 1);

    const fee =
      Number(app.artist.minimumFee) +
      Math.floor(rand() * (Number(app.artist.maximumFee) - Number(app.artist.minimumFee)));

    try {
      await prisma.performance.create({
        data: {
          eventId: app.eventId,
          artistId: app.artistId,
          startDateTime: perfStart,
          endDateTime: perfEnd,
          agreedFee: fee,
          status:
            app.event.status === EventStatus.COMPLETED
              ? PerformanceStatus.COMPLETED
              : PerformanceStatus.CONFIRMED,
        },
      });
    } catch {
      // skip conflicts
    }
  }

  console.log('Kreiranje ocena...');
  const completedPerformances = await prisma.performance.findMany({
    where: { status: PerformanceStatus.COMPLETED },
    include: { event: { include: { organizer: true } } },
    take: 25,
  });

  for (const perf of completedPerformances) {
    try {
      await prisma.review.create({
        data: {
          eventId: perf.eventId,
          organizerId: perf.event.organizerId,
          artistId: perf.artistId,
          rating: Math.floor(rand() * 2 + 4),
          comment: 'Odličan nastup, publika je bila oduševljena.',
        },
      });
    } catch {
      // skip duplicate reviews
    }
  }

  console.log('Kreiranje preporuka...');
  const publishedEvents = events.filter((e) => e.event.status !== EventStatus.DRAFT);
  for (const eventData of publishedEvents.slice(0, 20)) {
    const recommendedArtists = pickMany(artists, 5, rand);
    for (const artistData of recommendedArtists) {
      const score = Number((rand() * 0.5 + 0.4).toFixed(4));
      const explanations = [
        'Žanr se podudara',
        'Honorar je u okviru budžeta',
        'Izvođač se nalazi u istom gradu',
        score > 0.7 ? 'Prosečna ocena je viša od 4.5' : 'Dobar profil za ovaj tip događaja',
      ];
      try {
        await prisma.recommendation.create({
          data: {
            eventId: eventData.event.id,
            artistId: artistData.profile.id,
            score,
            modelVersion: '1.0.0',
            explanation: explanations.join('; '),
          },
        });
      } catch {
        // skip duplicates
      }
    }
  }

  console.log('Kreiranje notifikacija...');
  const allUsers = [admin, ...organizers.map((o) => o.user), ...artists.map((a) => a.user)];
  for (const user of allUsers.slice(0, 30)) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Dobrodošli na platformu',
        message: 'Vaš nalog je uspešno kreiran. Istražite dostupne događaje i izvođače.',
        isRead: rand() > 0.5,
      },
    });
  }

  console.log('Kreiranje ML training run zapisa...');
  await prisma.modelTrainingRun.create({
    data: {
      modelVersion: '1.0.0',
      algorithm: 'RandomForest',
      datasetSize: 2500,
      accuracy: 0.8724,
      precision: 0.8512,
      recall: 0.8398,
      f1Score: 0.8454,
      rocAuc: 0.9102,
      notes: 'Sintetički dataset — samo za prototip. Ne predstavlja stvarne podatke.',
    },
  });

  console.log('\nSeed završen uspešno!');
  console.log('\n=== Demonstracioni nalozi ===');
  console.log(`Admin:      admin@demo.local / ${DEMO_PASSWORDS.admin}`);
  console.log(`Organizator: organizer1@demo.local / ${DEMO_PASSWORDS.organizer}`);
  console.log(`Izvođač:    artist1@demo.local / ${DEMO_PASSWORDS.artist}`);
  console.log(`\nUkupno: 1 admin, ${organizers.length} organizatora, ${artists.length} izvođača, ${events.length} događaja`);
}

main()
  .catch((e) => {
    console.error('Seed greška:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
