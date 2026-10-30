import { PrismaClient, UserRole, TicketCategory, Priority, TicketStatus, IncidentSeverity, IncidentStatus, RoomStatus, RoomType, EquipmentStatus, Shift, AssignmentStatus, StockStatus, BookingStatus, EventType, ApprovalType, ApprovalStatus, NotificationType, PurchaseRequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Clearing previous data...');
  // Delete in safe reverse foreign-key order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.stockReservation.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.incidentTicket.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticketHistory.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.room.deleteMany();
  await prisma.building.deleteMany();
  await prisma.sLA.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Creating demo users for all 6 roles...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@campus360.edu',
      passwordHash,
      name: 'Aarav Sharma',
      role: UserRole.STUDENT,
      department: 'School of Computing & AI (B.Sc Year 3)',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@campus360.edu',
      passwordHash,
      name: 'Prof. Rajesh Kulkarni',
      role: UserRole.FACULTY,
      department: 'Department of Computer Science & AI',
      phone: '+91 98765 43219',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const techUser = await prisma.user.create({
    data: {
      email: 'tech@campus360.edu',
      passwordHash,
      name: 'Ramesh Kumar',
      role: UserRole.TECHNICIAN,
      department: 'Campus Electrical & Power Engineering',
      phone: '+91 98765 43211',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@campus360.edu',
      passwordHash,
      name: 'Dr. Priya Nair',
      role: UserRole.DEPARTMENT_MANAGER,
      department: 'Department of Computer Science & AI',
      phone: '+91 98765 43212',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@campus360.edu',
      passwordHash,
      name: 'Vikram Malhotra',
      role: UserRole.FACILITIES_ADMIN,
      department: 'Campus Infrastructure & Operations',
      phone: '+91 98765 43213',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const procurementUser = await prisma.user.create({
    data: {
      email: 'procurement@campus360.edu',
      passwordHash,
      name: 'Ananya Iyer',
      role: UserRole.PROCUREMENT_APPROVER,
      department: 'Finance & Material Procurement',
      phone: '+91 98765 43214',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  const sysAdminUser = await prisma.user.create({
    data: {
      email: 'sysadmin@campus360.edu',
      passwordHash,
      name: 'Devendra Patel',
      role: UserRole.SYSTEM_ADMIN,
      department: 'Enterprise IT & Campus Systems',
      phone: '+91 98765 43215',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  // Extra technician for load balancing demo
  const tech2User = await prisma.user.create({
    data: {
      email: 'tech2@campus360.edu',
      passwordHash,
      name: 'Kavita Sen',
      role: UserRole.TECHNICIAN,
      department: 'Network Operations & Smart Infrastructure',
      phone: '+91 98765 43216',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  console.log('[Seed] Creating staff profiles...');
  const techProfile1 = await prisma.staffProfile.create({
    data: {
      userId: techUser.id,
      employeeId: 'EMP-TECH-101',
      skills: ['Electrical', 'Power Systems', 'Circuit Breakers', 'Emergency Switching'],
      department: 'Campus Electrical & Power Engineering',
      shift: Shift.MORNING,
      isAvailable: true,
      activeAssignmentsCount: 1,
      maxConcurrentTickets: 4,
    },
  });

  const techProfile2 = await prisma.staffProfile.create({
    data: {
      userId: tech2User.id,
      employeeId: 'EMP-TECH-102',
      skills: ['Network / Wi-Fi', 'Audio/Visual', 'Classroom Equipment', 'Cisco Switching'],
      department: 'Network Operations & Smart Infrastructure',
      shift: Shift.MORNING,
      isAvailable: true,
      activeAssignmentsCount: 0,
      maxConcurrentTickets: 4,
    },
  });

  console.log('[Seed] Creating buildings and rooms...');
  const blockA = await prisma.building.create({
    data: {
      code: 'BLOCK-A',
      name: 'Science & Computing Complex (Block A)',
      campusZone: 'North Academic Zone',
      totalFloors: 4,
      description: 'Main lecture halls, AI & Data Science labs, and computing auditoriums.',
    },
  });

  const blockB = await prisma.building.create({
    data: {
      code: 'BLOCK-B',
      name: 'Engineering & Robotics Block (Block B)',
      campusZone: 'East Innovation Zone',
      totalFloors: 5,
      description: 'Robotics centers, mechanical workshops, and engineering seminar rooms.',
    },
  });

  const blockC = await prisma.building.create({
    data: {
      code: 'BLOCK-C',
      name: 'Humanities & Business Wing (Block C)',
      campusZone: 'South Campus Hub',
      totalFloors: 3,
      description: 'Management study halls, seminar conference rooms, and general classrooms.',
    },
  });

  // Rooms in Block A
  // A-204 is the primary scenario room!
  const roomA204 = await prisma.room.create({
    data: {
      buildingId: blockA.id,
      roomNumber: 'A-204',
      code: 'BLK-A-204',
      floor: 2,
      capacity: 70,
      roomType: RoomType.CLASSROOM,
      facilities: ['Projector', 'Air Conditioning', '60 Computer Terminals', 'Audio System', 'Backup Power'],
      status: RoomStatus.AVAILABLE,
      statusReason: null,
    },
  });

  const roomA301 = await prisma.room.create({
    data: {
      buildingId: blockA.id,
      roomNumber: 'A-301',
      code: 'BLK-A-301',
      floor: 3,
      capacity: 85,
      roomType: RoomType.LECTURE_HALL,
      facilities: ['Projector', 'Air Conditioning', '60 Computer Terminals', 'Audio System', 'Backup Power', 'Smart Podium'],
      status: RoomStatus.AVAILABLE,
    },
  });

  const roomA102 = await prisma.room.create({
    data: {
      buildingId: blockA.id,
      roomNumber: 'A-102',
      code: 'BLK-A-102',
      floor: 1,
      capacity: 40, // Under capacity (< 60) for demo rejection test!
      roomType: RoomType.CLASSROOM,
      facilities: ['Projector', 'Whiteboard'],
      status: RoomStatus.AVAILABLE,
    },
  });

  const roomA205 = await prisma.room.create({
    data: {
      buildingId: blockA.id,
      roomNumber: 'A-205',
      code: 'BLK-A-205',
      floor: 2,
      capacity: 65,
      roomType: RoomType.LAB,
      facilities: ['Projector', '60 Computer Terminals', 'Air Conditioning', 'Audio System'],
      status: RoomStatus.AVAILABLE,
    },
  });

  // Rooms in Block B
  const roomB101 = await prisma.room.create({
    data: {
      buildingId: blockB.id,
      roomNumber: 'B-101',
      code: 'BLK-B-101',
      floor: 1,
      capacity: 90,
      roomType: RoomType.LECTURE_HALL,
      facilities: ['Projector', 'Air Conditioning', '60 Computer Terminals', 'Audio System', 'Backup Power'],
      status: RoomStatus.AVAILABLE,
    },
  });

  const roomB202 = await prisma.room.create({
    data: {
      buildingId: blockB.id,
      roomNumber: 'B-202',
      code: 'BLK-B-202',
      floor: 2,
      capacity: 75,
      roomType: RoomType.CLASSROOM,
      facilities: ['Projector', 'Air Conditioning', '60 Computer Terminals'],
      status: RoomStatus.OCCUPIED, // Already occupied for conflict demo!
      statusReason: 'Reserved for Applied Physics Midterm',
    },
  });

  console.log('[Seed] Creating equipment records...');
  const projA204 = await prisma.equipment.create({
    data: {
      name: 'Epson Pro L1070U 4K Laser Projector',
      assetTag: 'AST-PRJ-A204',
      category: TicketCategory.CLASSROOM_EQUIPMENT,
      roomId: roomA204.id,
      serialNumber: 'EP-4K-98214',
      status: EquipmentStatus.OPERATIONAL,
      lastInspection: new Date(),
    },
  });

  const pduA204 = await prisma.equipment.create({
    data: {
      name: 'Schneider Industrial Main Distribution Panel & Breaker',
      assetTag: 'AST-PDU-A204',
      category: TicketCategory.ELECTRICAL,
      roomId: roomA204.id,
      serialNumber: 'SCH-PDU-5542',
      status: EquipmentStatus.OPERATIONAL,
      lastInspection: new Date(),
    },
  });

  await prisma.equipment.create({
    data: {
      name: 'Daikin VRV IV-S Intelligent Inverter AC System',
      assetTag: 'AST-HVAC-A301',
      category: TicketCategory.HVAC,
      roomId: roomA301.id,
      status: EquipmentStatus.OPERATIONAL,
    },
  });

  console.log('[Seed] Creating examination and booking for disruption scenario...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const examinationA204 = await prisma.examination.create({
    data: {
      examCode: 'EXAM-2026-AI60',
      courseTitle: 'B.Sc AI & Data Science - Core Systems Final Examination',
      department: 'Department of Computer Science & AI',
      studentCount: 60,
      roomId: roomA204.id,
      examDate: today,
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      status: BookingStatus.CONFIRMED,
      notes: 'Mandatory high-stakes semester final exam for 60 undergraduate students.',
    },
  });

  // Create initial booking for the exam in room A-204
  await prisma.booking.create({
    data: {
      roomId: roomA204.id,
      title: 'B.Sc AI & Data Science Exam (60 Students)',
      bookedById: managerUser.id,
      eventType: EventType.EXAMINATION,
      date: today,
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      status: BookingStatus.CONFIRMED,
    },
  });

  // Conflicting booking in B-202
  await prisma.booking.create({
    data: {
      roomId: roomB202.id,
      title: 'Applied Physics Midterm Examination',
      bookedById: adminUser.id,
      eventType: EventType.EXAMINATION,
      date: today,
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      status: BookingStatus.CONFIRMED,
    },
  });

  console.log('[Seed] Creating inventory items...');
  const itemBreaker = await prisma.inventoryItem.create({
    data: {
      sku: 'INV-CB-40A',
      name: '40A Industrial Heavy-Duty Circuit Breaker (Schneider)',
      category: TicketCategory.ELECTRICAL,
      quantity: 12,
      minStockThreshold: 4,
      reservedQuantity: 0,
      unitCost: 110.0,
      locationBin: 'Whse-A-Bay1-Shelf2',
      status: StockStatus.IN_STOCK,
    },
  });

  const itemPatchCable = await prisma.inventoryItem.create({
    data: {
      sku: 'INV-NET-CAT6',
      name: 'Cat6A High-Speed Shielded Ethernet Cable 10m',
      category: TicketCategory.NETWORK_WIFI,
      quantity: 50,
      minStockThreshold: 15,
      reservedQuantity: 0,
      unitCost: 18.5,
      locationBin: 'Whse-A-Bay3-Bin4',
      status: StockStatus.IN_STOCK,
    },
  });

  const itemLamp = await prisma.inventoryItem.create({
    data: {
      sku: 'INV-PRJ-LAMP',
      name: 'Epson 4K Laser Projector Optical Engine Lamp',
      category: TicketCategory.CLASSROOM_EQUIPMENT,
      quantity: 2, // Low stock!
      minStockThreshold: 5,
      reservedQuantity: 0,
      unitCost: 195.0,
      locationBin: 'Whse-B-Electronics-A1',
      status: StockStatus.LOW_STOCK,
    },
  });

  const itemRefrigerant = await prisma.inventoryItem.create({
    data: {
      sku: 'INV-HVAC-R410A',
      name: 'Daikin Eco-Safe R410A Refrigerant 11kg Canister',
      category: TicketCategory.HVAC,
      quantity: 0, // Out of stock!
      minStockThreshold: 3,
      reservedQuantity: 0,
      unitCost: 245.0,
      locationBin: 'Whse-C-HazmatLockbox',
      status: StockStatus.OUT_OF_STOCK,
    },
  });

  console.log('[Seed] Creating SLA policies...');
  const slaPolicies = [
    { category: TicketCategory.ELECTRICAL, priority: Priority.CRITICAL, targetHours: 2 },
    { category: TicketCategory.ELECTRICAL, priority: Priority.HIGH, targetHours: 6 },
    { category: TicketCategory.ELECTRICAL, priority: Priority.MEDIUM, targetHours: 12 },
    { category: TicketCategory.ELECTRICAL, priority: Priority.LOW, targetHours: 24 },
    { category: TicketCategory.HVAC, priority: Priority.HIGH, targetHours: 8 },
    { category: TicketCategory.NETWORK_WIFI, priority: Priority.HIGH, targetHours: 4 },
    { category: TicketCategory.CLASSROOM_EQUIPMENT, priority: Priority.HIGH, targetHours: 4 },
    { category: TicketCategory.PLUMBING, priority: Priority.HIGH, targetHours: 6 },
    { category: TicketCategory.OTHER, priority: Priority.MEDIUM, targetHours: 24 },
  ];

  for (const sla of slaPolicies) {
    await prisma.sLA.create({ data: sla });
  }

  console.log('[Seed] Creating initial campus tickets...');
  const ticket1 = await prisma.ticket.create({
    data: {
      id: 'CMP-2026-0001',
      title: 'Complete HVAC Cooling Drop in Block B Lab 102',
      description: 'The server lab temperature has spiked to 31°C due to refrigerant loss in the central compressor.',
      category: TicketCategory.HVAC,
      priority: Priority.HIGH,
      status: TicketStatus.BLOCKED,
      blockedReason: 'Awaiting Daikin R410A Refrigerant stock delivery.',
      buildingId: blockB.id,
      reporterId: managerUser.id,
      assignedToId: techUser.id,
      slaHours: 8,
      slaDeadline: new Date(Date.now() + 8 * 3600 * 1000),
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      id: 'CMP-2026-0002',
      title: 'Campus Central Wi-Fi Gateway Flapping in Library Wing',
      description: 'Multiple students reporting intermittent DNS timeouts and packet drops in the quiet study zone.',
      category: TicketCategory.NETWORK_WIFI,
      priority: Priority.MEDIUM,
      status: TicketStatus.TRIAGED,
      buildingId: blockC.id,
      reporterId: studentUser.id,
      slaHours: 12,
      slaDeadline: new Date(Date.now() + 12 * 3600 * 1000),
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      id: 'CMP-2026-0003',
      title: 'Water Pipe Joint Leakage in Block C 2nd Floor Restroom',
      description: 'Visible seepage on the ceiling tiles directly above seminar room C-201.',
      category: TicketCategory.PLUMBING,
      priority: Priority.HIGH,
      status: TicketStatus.ASSIGNED,
      buildingId: blockC.id,
      reporterId: adminUser.id,
      assignedToId: techUser.id,
      slaHours: 6,
      slaDeadline: new Date(Date.now() + 6 * 3600 * 1000),
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      id: 'CMP-2026-0004',
      title: 'Smart Podium Microphone Crackle in Room A-301',
      description: 'Lectern microphone cord has loose grounding contact.',
      category: TicketCategory.CLASSROOM_EQUIPMENT,
      priority: Priority.LOW,
      status: TicketStatus.RESOLVED,
      buildingId: blockA.id,
      roomId: roomA301.id,
      reporterId: managerUser.id,
      assignedToId: tech2User.id,
      slaHours: 24,
      slaDeadline: new Date(Date.now() - 2 * 3600 * 1000),
      resolvedAt: new Date(),
    },
  });

  console.log('[Seed] Creating initial purchase request and approval...');
  const pr1 = await prisma.purchaseRequest.create({
    data: {
      id: 'PR-2026-0001',
      itemId: itemLamp.id,
      quantity: 5,
      estimatedCost: 975.0,
      reason: 'Critical restock of 4K optical lamps for semester final examination auditoriums.',
      requesterId: adminUser.id,
      status: PurchaseRequestStatus.PENDING,
    },
  });

  await prisma.approval.create({
    data: {
      entityType: ApprovalType.PURCHASE_REQUEST,
      entityId: pr1.id,
      requesterId: adminUser.id,
      status: ApprovalStatus.PENDING,
      reason: 'Urgent restocking order of projector optical engines before finals week.',
    },
  });

  console.log('[Seed] Creating initial audit log and notification...');
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_BOOTSTRAP',
      entity: 'System',
      entityId: 'CAMPUS360-INIT',
      userId: sysAdminUser.id,
      details: {
        event: 'Campus360 V1 Enterprise Instance Initialized with PostgreSQL',
        timestamp: new Date().toISOString(),
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: 'System Operational: All Campus Zones Synced',
      message: 'Campus360 V1 platform is online with active IoT monitoring and AI incident extraction.',
      type: NotificationType.SYSTEM,
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: procurementUser.id,
      title: 'Action Required: Pending Purchase Request PR-2026-0001',
      message: 'Vikram Malhotra submitted a purchase request for 5x Epson 4K Projector Lamps ($975.00).',
      type: NotificationType.APPROVAL,
      read: false,
    },
  });

  console.log('[Seed] Database successfully populated with realistic campus records!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
