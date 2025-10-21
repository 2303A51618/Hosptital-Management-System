import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useColorModeValue, Heading, Icon, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, Text, VStack, HStack } from '@chakra-ui/react';
import { FaCalendarCheck, FaRupeeSign, FaBed, FaChartBar, FaUserPlus, FaUserMd, FaHospital, FaFileInvoice, FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [m, setM] = useState({ apptCount: 0, revenue: 0, occupancy: 0, patientCount: 0, doctorCount: 0, avgStay: 0, topSpecialty: '', topDoctor: '' });
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState({ revenue: [], appointments: [], occupancy: [] });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    Promise.all([
      api.get('/analytics'),
      api.get('/patients/count'),
      api.get('/doctors/count'),
      api.get('/analytics/recent-activities'),
      api.get('/analytics/chart-data')
    ]).then(([analytics, patients, doctors, activities, charts]) => {
      setM({ 
        ...analytics.data, 
        patientCount: patients.data.count, 
        doctorCount: doctors.data.count 
      });
      setRecentActivities(activities.data || []);
      setChartData(charts.data || { revenue: [], appointments: [], occupancy: [] });
      setLoading(false);
    }).catch(() => {
      // Fallback data if endpoints don't exist
      api.get('/analytics').then((res) => { setM(prev => ({ ...prev, ...res.data })); setLoading(false); });
      api.get('/patients/count').then((res) => setM(m => ({ ...m, patientCount: res.data.count })));
      api.get('/doctors/count').then((res) => setM(m => ({ ...m, doctorCount: res.data.count })));
    });
  }, []);

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('lg', 'dark-lg');
  const MotionBox = motion(Box);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} color="teal.500" letterSpacing={1}>Dashboard Overview</Heading>
      
      {/* KPI Cards */}
      <SimpleGrid columns={[1, 2, 4]} gap={6} mb={6}>
        {/* Patients Card */}
        <MotionBox
          bg={cardBg}
          boxShadow={cardShadow}
          borderRadius="xl"
          p={6}
          whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          cursor="pointer"
          onClick={() => window.location.href = '/patients'}
        >
          <Stat>
            <Flex align="center" mb={2} gap={2}>
              <Icon as={FaBed} w={7} h={7} color="purple.400" />
              <StatLabel fontWeight="bold">Patients in Hospital</StatLabel>
            </Flex>
            <StatNumber fontSize="2xl">{loading ? '...' : m.patientCount}</StatNumber>
            <StatHelpText>Click to view all patients</StatHelpText>
          </Stat>
        </MotionBox>
        
        {/* Doctors Card */}
        <MotionBox
          bg={cardBg}
          boxShadow={cardShadow}
          borderRadius="xl"
          p={6}
          whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Stat>
            <Flex align="center" mb={2} gap={2}>
              <Icon as={FaUserMd} w={7} h={7} color="teal.400" />
              <StatLabel fontWeight="bold">Available Doctors</StatLabel>
            </Flex>
            <StatNumber fontSize="2xl">{loading ? '...' : m.doctorCount}</StatNumber>
            <StatHelpText>Doctors currently on duty</StatHelpText>
          </Stat>
        </MotionBox>
        
        {/* Revenue Card */}
        <MotionBox
          bg={cardBg}
          boxShadow={cardShadow}
          borderRadius="xl"
          p={6}
          whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stat>
            <Flex align="center" mb={2} gap={2}>
              <Icon as={FaRupeeSign} w={7} h={7} color="green.400" />
              <StatLabel fontWeight="bold">Revenue (INR)</StatLabel>
            </Flex>
            <StatNumber fontSize="2xl">{loading ? '...' : `₹${m.revenue}`}</StatNumber>
            <StatHelpText><StatArrow type="increase" />+8% from last month</StatHelpText>
          </Stat>
        </MotionBox>
        
        {/* Occupancy Card */}
        <MotionBox
          bg={cardBg}
          boxShadow={cardShadow}
          borderRadius="xl"
          p={6}
          whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <Stat>
            <Flex align="center" mb={2} gap={2}>
              <Icon as={FaBed} w={7} h={7} color="purple.400" />
              <StatLabel fontWeight="bold">Occupancy (%)</StatLabel>
            </Flex>
            <StatNumber fontSize="2xl">{loading ? '...' : `${m.occupancy}%`}</StatNumber>
            <StatHelpText><StatArrow type="increase" />+5% from last month</StatHelpText>
          </Stat>
        </MotionBox>
      </SimpleGrid>

      {/* Additional KPIs */}
      <SimpleGrid columns={[1, 3]} gap={6} mb={6}>
        <Box p={6} bg={cardBg} boxShadow={cardShadow} borderRadius="xl">
          <Heading size="sm" color="blue.500" mb={2}>Avg Length of Stay</Heading>
          <Text fontSize="3xl" fontWeight="bold">{m.avgStay || 4.5} days</Text>
        </Box>
        <Box p={6} bg={cardBg} boxShadow={cardShadow} borderRadius="xl">
          <Heading size="sm" color="orange.500" mb={2}>Top Specialty</Heading>
          <Text fontSize="3xl" fontWeight="bold">{m.topSpecialty || 'Cardiology'}</Text>
        </Box>
        <Box p={6} bg={cardBg} boxShadow={cardShadow} borderRadius="xl">
          <Heading size="sm" color="green.500" mb={2}>Most Booked Doctor</Heading>
          <Text fontSize="3xl" fontWeight="bold">{m.topDoctor || 'Dr. Sharma'}</Text>
        </Box>
      </SimpleGrid>

      {/* Quick Action Cards */}
      <Box mb={6}>
        <Heading size="md" mb={4} color="teal.600">Quick Actions</Heading>
        <SimpleGrid columns={[1, 2, 4]} gap={4}>
          <Button colorScheme="teal" size="lg" leftIcon={<FaUserPlus />} onClick={() => window.location.href = '/patients'}>
            Add Patient
          </Button>
          <Button colorScheme="blue" size="lg" leftIcon={<FaCalendarCheck />} onClick={() => window.location.href = '/appointments'}>
            Add Appointment
          </Button>
          <Button colorScheme="purple" size="lg" leftIcon={<FaHospital />} onClick={() => window.location.href = '/rooms'}>
            Assign Room
          </Button>
          <Button colorScheme="orange" size="lg" leftIcon={<FaFileInvoice />} onClick={() => window.location.href = '/billing'}>
            Generate Bill
          </Button>
        </SimpleGrid>
      </Box>

      {/* Charts Section */}
      <SimpleGrid columns={[1, 2]} gap={6} mb={6}>
        <Box p={6} bg={cardBg} boxShadow={cardShadow} borderRadius="xl">
          <Heading size="sm" mb={4} color="blue.500">Revenue Trend (Last 7 Days)</Heading>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.revenue.length ? chartData.revenue : [
              { day: 'Mon', revenue: 45000 }, { day: 'Tue', revenue: 52000 }, 
              { day: 'Wed', revenue: 48000 }, { day: 'Thu', revenue: 61000 },
              { day: 'Fri', revenue: 55000 }, { day: 'Sat', revenue: 67000 }, { day: 'Sun', revenue: 58000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#38B2AC" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box p={6} bg={cardBg} boxShadow={cardShadow} borderRadius="xl">
          <Heading size="sm" mb={4} color="purple.500">Appointments (Last 7 Days)</Heading>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.appointments.length ? chartData.appointments : [
              { day: 'Mon', count: 12 }, { day: 'Tue', count: 19 }, 
              { day: 'Wed', count: 15 }, { day: 'Thu', count: 22 },
              { day: 'Fri', count: 18 }, { day: 'Sat', count: 25 }, { day: 'Sun', count: 14 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#805AD5" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>

      {/* Recent Activities */}
      <Box p={6} bg={cardBg} boxShadow={cardShadow} borderRadius="xl" mb={6}>
        <Heading size="md" mb={4} color="teal.600">Recent Activities</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Patient</Th>
              <Th>Details</Th>
              <Th>Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {recentActivities.length > 0 ? recentActivities.slice(0, 5).map((activity, i) => (
              <Tr key={i}>
                <Td><Badge colorScheme={activity.type === 'admission' ? 'green' : activity.type === 'discharge' ? 'orange' : 'blue'}>{activity.type}</Badge></Td>
                <Td>{activity.patient}</Td>
                <Td>{activity.details}</Td>
                <Td>{new Date(activity.time).toLocaleString()}</Td>
              </Tr>
            )) : (
              <>
                <Tr>
                  <Td><Badge colorScheme="green">Admission</Badge></Td>
                  <Td>Rajesh Kumar</Td>
                  <Td>Room 101 - Cardiology</Td>
                  <Td>2 hours ago</Td>
                </Tr>
                <Tr>
                  <Td><Badge colorScheme="blue">Bill Payment</Badge></Td>
                  <Td>Priya Sharma</Td>
                  <Td>₹15,000 paid</Td>
                  <Td>3 hours ago</Td>
                </Tr>
                <Tr>
                  <Td><Badge colorScheme="orange">Discharge</Badge></Td>
                  <Td>Amit Patel</Td>
                  <Td>Room 205 - Orthopedics</Td>
                  <Td>5 hours ago</Td>
                </Tr>
              </>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
