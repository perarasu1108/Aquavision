const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Borewell = require('../models/Borewell');
const GroundwaterLevel = require('../models/GroundwaterLevel');
const RechargeStructure = require('../models/RechargeStructure');
const ExtractionRecord = require('../models/ExtractionRecord');
const Alert = require('../models/Alert');

const districts = ['Coimbatore', 'Salem', 'Madurai', 'Trichy', 'Erode'];
const blocks = {
  'Coimbatore': ['Pollachi', 'Valparai', 'Kinathukadavu', 'Sulur', 'Annur'],
  'Salem': ['Attur', 'Mettur', 'Omalur', 'Edappadi', 'Gangavalli'],
  'Madurai': ['Melur', 'Peraiyur', 'Thirumangalam', 'Usilampatti', 'Vadipatti'],
  'Trichy': ['Lalgudi', 'Musiri', 'Thottiyam', 'Manapparai', 'Srirangam'],
  'Erode': ['Bhavani', 'Gobichettipalayam', 'Sathyamangalam', 'Perundurai', 'Anthiyur']
};

const villages = [
  'Kallapatti', 'Vadavalli', 'Thondamuthur', 'Karamadai', 'Perur',
  'Singanallur', 'Kovaipudur', 'Gandhipuram', 'Palladam', 'Tiruppur',
  'Reddiyur', 'Mettupatti', 'Keelaiyur', 'Vadakkupatti', 'Thennampatti'
];

const pumpTypes = ['Submersible', 'Centrifugal', 'Jet', 'Hand Pump'];
const purposes = ['Irrigation', 'Drinking', 'Industrial', 'Domestic', 'Other'];
const seasons = ['Pre-Monsoon', 'Monsoon', 'Post-Monsoon', 'Rabi'];
const structureTypes = ['Check Dam', 'Percolation Tank', 'Recharge Shaft', 'Recharge Well', 'Farm Pond', 'Nala Bund', 'Gabion Structure'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Tamil Nadu approximate lat/lng ranges
function randomLocation(district) {
  const centers = {
    'Coimbatore': { lat: 11.0168, lng: 76.9558 },
    'Salem': { lat: 11.6643, lng: 78.1460 },
    'Madurai': { lat: 9.9252, lng: 78.1198 },
    'Trichy': { lat: 10.7905, lng: 78.7047 },
    'Erode': { lat: 11.3410, lng: 77.7172 }
  };
  const center = centers[district] || centers['Coimbatore'];
  return {
    type: 'Point',
    coordinates: [
      center.lng + randomBetween(-0.3, 0.3),
      center.lat + randomBetween(-0.3, 0.3)
    ]
  };
}

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Borewell.deleteMany({}),
      GroundwaterLevel.deleteMany({}),
      RechargeStructure.deleteMany({}),
      ExtractionRecord.deleteMany({}),
      Alert.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // === USERS ===
    const users = await User.create([
      {
        name: 'Dr. Rajesh Kumar',
        email: 'admin@aquavision.gov.in',
        password: 'admin123',
        role: 'Admin',
        department: 'Water Resources Department',
        district: 'Coimbatore'
      },
      {
        name: 'Priya Sharma',
        email: 'officer@aquavision.gov.in',
        password: 'officer123',
        role: 'Field Officer',
        department: 'Water Resources Department',
        district: 'Salem'
      },
      {
        name: 'Arun Patel',
        email: 'viewer@aquavision.gov.in',
        password: 'viewer123',
        role: 'Viewer',
        department: 'Water Resources Department',
        district: 'Madurai'
      }
    ]);
    console.log(`👤 Created ${users.length} users`);

    // === BOREWELLS ===
    const borewellData = [];
    let bwCounter = 1;
    for (const district of districts) {
      const blockList = blocks[district];
      const count = randomInt(8, 14);
      for (let i = 0; i < count; i++) {
        const status = Math.random() > 0.15 ? (Math.random() > 0.1 ? 'Active' : 'Under Maintenance') : 'Inactive';
        const depth = randomBetween(50, 250);
        const waterLevel = randomBetween(3, 22);

        borewellData.push({
          borewellId: `BW-${String(bwCounter).padStart(3, '0')}`,
          name: `${randomItem(villages)} Borewell ${randomInt(1, 5)}`,
          location: randomLocation(district),
          depth: parseFloat(depth.toFixed(1)),
          diameter: randomItem([4, 6, 8, 10]),
          status,
          installedDate: new Date(randomInt(2010, 2024), randomInt(0, 11), randomInt(1, 28)),
          lastServicedDate: new Date(randomInt(2023, 2026), randomInt(0, 7), randomInt(1, 28)),
          currentWaterLevel: parseFloat(waterLevel.toFixed(2)),
          yieldRate: parseFloat(randomBetween(500, 5000).toFixed(0)),
          pumpType: randomItem(pumpTypes),
          motorHP: randomItem([3, 5, 7.5, 10, 15]),
          district,
          block: randomItem(blockList),
          village: randomItem(villages),
          owner: Math.random() > 0.3 ? 'Government' : 'Private'
        });
        bwCounter++;
      }
    }
    const borewells = await Borewell.create(borewellData);
    console.log(`🔧 Created ${borewells.length} borewells`);

    // === GROUNDWATER LEVELS (12 months of data per borewell) ===
    const gwData = [];
    for (const bw of borewells) {
      const baseLevel = bw.currentWaterLevel;
      for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
        const date = new Date();
        date.setMonth(date.getMonth() - monthOffset);
        date.setDate(randomInt(1, 28));

        const month = date.getMonth();
        let season;
        if (month >= 2 && month <= 4) season = 'Pre-Monsoon';
        else if (month >= 5 && month <= 8) season = 'Monsoon';
        else if (month >= 9 && month <= 10) season = 'Post-Monsoon';
        else season = 'Rabi';

        // Simulate seasonal variation
        let seasonalOffset = 0;
        if (season === 'Monsoon') seasonalOffset = -randomBetween(1, 4);
        else if (season === 'Pre-Monsoon') seasonalOffset = randomBetween(1, 3);
        else if (season === 'Post-Monsoon') seasonalOffset = -randomBetween(0.5, 2);

        const waterLevel = Math.max(1, Math.min(25, baseLevel + seasonalOffset + randomBetween(-1.5, 1.5)));

        gwData.push({
          borewellId: bw._id,
          waterLevel: parseFloat(waterLevel.toFixed(2)),
          measuredAt: date,
          season,
          measuredBy: users[randomInt(0, 2)]._id,
          qualityParams: {
            ph: parseFloat(randomBetween(6.5, 8.5).toFixed(1)),
            tds: parseFloat(randomBetween(200, 1200).toFixed(0)),
            hardness: parseFloat(randomBetween(100, 500).toFixed(0)),
            chloride: parseFloat(randomBetween(50, 400).toFixed(0)),
            fluoride: parseFloat(randomBetween(0.2, 2.5).toFixed(1)),
            nitrate: parseFloat(randomBetween(5, 80).toFixed(0))
          }
        });
      }
    }
    await GroundwaterLevel.insertMany(gwData);
    console.log(`💧 Created ${gwData.length} groundwater readings`);

    // === RECHARGE STRUCTURES ===
    const rechargeData = [];
    let rsCounter = 1;
    for (const district of districts) {
      const count = randomInt(3, 6);
      for (let i = 0; i < count; i++) {
        const type = randomItem(structureTypes);
        const condition = randomItem(['Good', 'Good', 'Good', 'Fair', 'Fair', 'Poor']);
        const status = condition === 'Poor' && Math.random() > 0.5 ? 'Needs Repair' : 'Operational';

        rechargeData.push({
          structureId: `RS-${String(rsCounter).padStart(3, '0')}`,
          name: `${randomItem(villages)} ${type}`,
          type,
          location: randomLocation(district),
          capacity: parseFloat(randomBetween(5000, 100000).toFixed(0)),
          currentStorageLevel: parseFloat(randomBetween(10, 95).toFixed(1)),
          constructionYear: randomInt(2005, 2024),
          status,
          condition,
          beneficiaryVillages: Array.from({ length: randomInt(2, 5) }, () => randomItem(villages)),
          lastInspectionDate: new Date(randomInt(2024, 2026), randomInt(0, 7), randomInt(1, 28)),
          estimatedRecharge: parseFloat(randomBetween(10000, 500000).toFixed(0)),
          cost: parseFloat(randomBetween(500000, 15000000).toFixed(0)),
          district,
          block: randomItem(blocks[district])
        });
        rsCounter++;
      }
    }
    const rechargeStructures = await RechargeStructure.create(rechargeData);
    console.log(`🏗️  Created ${rechargeStructures.length} recharge structures`);

    // === EXTRACTION RECORDS (6 months of daily-ish data) ===
    const extractionData = [];
    const activeBorewells = borewells.filter(bw => bw.status === 'Active');
    for (const bw of activeBorewells) {
      for (let dayOffset = 180; dayOffset >= 0; dayOffset -= randomInt(1, 3)) {
        const date = new Date();
        date.setDate(date.getDate() - dayOffset);
        date.setHours(randomInt(5, 18), randomInt(0, 59));

        extractionData.push({
          borewellId: bw._id,
          extractionDate: date,
          volumeExtracted: parseFloat(randomBetween(500, 15000).toFixed(0)),
          pumpingDuration: parseFloat(randomBetween(1, 12).toFixed(1)),
          purpose: randomItem(purposes),
          operatorName: randomItem(['Raju', 'Suresh', 'Venkat', 'Kumar', 'Ganesan', 'Muthu', 'Selvam']),
          district: bw.district
        });
      }
    }
    await ExtractionRecord.insertMany(extractionData);
    console.log(`🔄 Created ${extractionData.length} extraction records`);

    // === ALERTS ===
    const alertData = [];
    const alertTypes = [
      { type: 'Critical Water Level', severity: 'Critical', titleFn: (bw) => `Critical water level at ${bw.borewellId}`, messageFn: (bw) => `Water level at ${bw.name} has dropped to ${bw.currentWaterLevel}m below ground level. Immediate action required.` },
      { type: 'Over-Extraction', severity: 'High', titleFn: (bw) => `Over-extraction warning: ${bw.borewellId}`, messageFn: (bw) => `Extraction at ${bw.name} exceeds sustainable limits. Pumping duration has exceeded 10 hours/day.` },
      { type: 'Quality Alert', severity: 'Medium', titleFn: (bw) => `Water quality concern: ${bw.borewellId}`, messageFn: (bw) => `TDS levels at ${bw.name} have exceeded 1000 mg/L. Water may not be suitable for drinking.` },
      { type: 'Maintenance Due', severity: 'Low', titleFn: (bw) => `Maintenance due: ${bw.borewellId}`, messageFn: (bw) => `${bw.name} is due for scheduled maintenance. Last serviced on ${bw.lastServicedDate?.toLocaleDateString() || 'N/A'}.` }
    ];

    // Create alerts for critical borewells
    const criticalBorewells = borewells.filter(bw => bw.currentWaterLevel > 15);
    for (const bw of criticalBorewells) {
      const alertType = alertTypes[0];
      alertData.push({
        type: alertType.type,
        severity: alertType.severity,
        title: alertType.titleFn(bw),
        message: alertType.messageFn(bw),
        relatedEntity: { entityType: 'Borewell', entityId: bw._id, entityName: bw.borewellId },
        district: bw.district,
        isRead: Math.random() > 0.5,
        isResolved: false,
        createdAt: new Date(Date.now() - randomInt(0, 7) * 86400000)
      });
    }

    // Add some more random alerts
    for (let i = 0; i < 15; i++) {
      const bw = randomItem(borewells);
      const alertType = randomItem(alertTypes.slice(1));
      const daysAgo = randomInt(0, 30);
      const isResolved = daysAgo > 14 && Math.random() > 0.4;

      alertData.push({
        type: alertType.type,
        severity: alertType.severity,
        title: alertType.titleFn(bw),
        message: alertType.messageFn(bw),
        relatedEntity: { entityType: 'Borewell', entityId: bw._id, entityName: bw.borewellId },
        district: bw.district,
        isRead: isResolved || Math.random() > 0.6,
        isResolved,
        resolvedAt: isResolved ? new Date(Date.now() - randomInt(0, daysAgo) * 86400000) : undefined,
        createdAt: new Date(Date.now() - daysAgo * 86400000)
      });
    }

    // Recharge structure alerts
    const poorStructures = rechargeStructures.filter(rs => rs.condition === 'Poor');
    for (const rs of poorStructures) {
      alertData.push({
        type: 'Structure Damage',
        severity: 'High',
        title: `Structural damage: ${rs.structureId}`,
        message: `${rs.name} (${rs.type}) is in poor condition and requires immediate repair. Last inspection: ${rs.lastInspectionDate?.toLocaleDateString() || 'N/A'}.`,
        relatedEntity: { entityType: 'RechargeStructure', entityId: rs._id, entityName: rs.structureId },
        district: rs.district,
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - randomInt(0, 14) * 86400000)
      });
    }

    await Alert.insertMany(alertData);
    console.log(`🚨 Created ${alertData.length} alerts`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin:    admin@aquavision.gov.in / admin123');
    console.log('   Officer:  officer@aquavision.gov.in / officer123');
    console.log('   Viewer:   viewer@aquavision.gov.in / viewer123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
}

seedData();
