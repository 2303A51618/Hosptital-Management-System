import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Box, Heading, SimpleGrid, Badge, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, FormControl, FormLabel, Select, Text, Divider, Tag, Avatar, Tooltip, IconButton, useToast, Input, Flex, HStack, InputGroup, InputLeftElement, Stat, StatLabel, StatNumber, StatHelpText, VStack } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import { FaUserMd, FaUserNurse, FaBed, FaRupeeSign, FaCalendarAlt, FaPrint, FaHistory, FaNotesMedical, FaQrcode, FaBroom, FaExclamationTriangle, FaCommentDots, FaSearch, FaFilter } from 'react-icons/fa';

export default function Rooms() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ number: '', type: 'AC' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [patients, setPatients] = useState([]);
  const [assignId, setAssignId] = useState('');
  const [loading, setLoading] = useState(false);
  const acRate = 1000;
  const nonAcRate = 500;

  useEffect(() => {
    api.get('/rooms').then((r) => {
      setList(r.data);
      setFilteredList(r.data);
    });
    api.get('/patients').then((r) => setPatients(r.data.items || r.data));
    const socket = io(process.env.REACT_APP_SOCKET_URL, { withCredentials: true, transports: ['websocket'] });
    socket.on('room:update', (u) => {
      setList((prev) => prev.map((r) => (r._id === u.roomId ? { ...r, occupied: u.occupied, currentPatient: u.patient || null } : r)));
    });
    return () => socket.close();
  }, []);

  useEffect(() => {
    let filtered = list;
    if (searchQuery) {
      filtered = filtered.filter(r => r.number.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter) {
      filtered = filtered.filter(r => statusFilter === 'occupied' ? r.occupied : !r.occupied);
    }
    if (typeFilter) {
      filtered = filtered.filter(r => r.type === typeFilter);
    }
    setFilteredList(filtered);
  }, [searchQuery, statusFilter, typeFilter, list]);

  const openModal = async (room) => {
    setSelected(room);
    setAssignId('');
    setModalOpen(true);
    try {
      const res = await api.get(`/rooms/${room._id}/details`);
      setRoomDetails(res.data);
    } catch {}
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      await api.post(`/rooms/${selected._id}/assign`, { patientId: assignId });
      setModalOpen(false);
      api.get('/rooms').then((r) => setList(r.data));
    } catch {}
    setLoading(false);
  };

  const handleRelease = async () => {
    setLoading(true);
    try {
      await api.post(`/rooms/${selected._id}/release`);
      setModalOpen(false);
      api.get('/rooms').then((r) => setList(r.data));
    } catch {}
    setLoading(false);
  };

  const toast = useToast();
  const handleAddRoom = async () => {
    if (!newRoom.number || !newRoom.type) {
      toast({ title: 'Room number and type required.', status: 'error', duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      await api.post('/rooms', newRoom);
      toast({ title: 'Room added successfully!', status: 'success', duration: 3000 });
      setAddModalOpen(false);
      setNewRoom({ number: '', type: 'AC' });
      api.get('/rooms').then((r) => setList(r.data));
    } catch {
      toast({ title: 'Failed to add room.', status: 'error', duration: 3000 });
    }
    setLoading(false);
  };

  return (
    <Box p={6}>
      <Heading size="md" mb={2}>Rooms ({filteredList.length})</Heading>
      {/* Summary Stats */}
      <HStack spacing={4} mb={4} flexWrap="wrap">
        {(() => {
          const total = list.length;
          const occupied = list.filter(r=>r.occupied).length;
          const vacant = total - occupied;
          const ac = list.filter(r=>r.type==='AC').length;
          const nonac = list.filter(r=>r.type==='Non-AC').length;
          return (
            <>
              <Stat minW="160px">
                <StatLabel>Total</StatLabel>
                <StatNumber>{total}</StatNumber>
                <StatHelpText>rooms</StatHelpText>
              </Stat>
              <Stat minW="160px">
                <StatLabel>Occupied</StatLabel>
                <StatNumber color="red.500">{occupied}</StatNumber>
                <StatHelpText>currently</StatHelpText>
              </Stat>
              <Stat minW="160px">
                <StatLabel>Vacant</StatLabel>
                <StatNumber color="green.500">{vacant}</StatNumber>
                <StatHelpText>available</StatHelpText>
              </Stat>
              <Stat minW="160px">
                <StatLabel>AC</StatLabel>
                <StatNumber>{ac}</StatNumber>
                <StatHelpText>₹{acRate}/day</StatHelpText>
              </Stat>
              <Stat minW="160px">
                <StatLabel>Non-AC</StatLabel>
                <StatNumber>{nonac}</StatNumber>
                <StatHelpText>₹{nonAcRate}/day</StatHelpText>
              </Stat>
            </>
          );
        })()}
      </HStack>
      
      {/* Search and Filter Bar */}
      <Flex direction={['column', 'column', 'row']} gap={3} mb={4} align="flex-end" justify="space-between">
        <HStack spacing={3} flex="1" w={['100%', '100%', 'auto']}>
          <InputGroup maxW={['100%', '100%', '300px']}>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search by room number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            placeholder="Status" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="150px"
            icon={<FaFilter />}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </Select>
          
          <Select 
            placeholder="Type" 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            maxW="150px"
            icon={<FaFilter />}
          >
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
          </Select>
        </HStack>
        
        <Button colorScheme="teal" onClick={() => setAddModalOpen(true)}>Add New Room</Button>
      </Flex>
      
      <SimpleGrid columns={[1,2,3,4]} spacing={4}>
        {filteredList.map((r) => (
          <Box key={r._id} p={4} borderWidth={2} borderColor="teal.200" borderRadius="xl" boxShadow="md" bgGradient="linear(to-br, white, teal.50)" transition="all 0.2s" _hover={{ boxShadow: 'xl', transform: 'scale(1.03)', bg: 'teal.25' }}>
            <Avatar name={`Room ${r.number}`} size="lg" mb={2} />
            <Heading size="sm" color="teal.600" mb={1}>Room {r.number}</Heading>
            <HStack mb={1} spacing={2}>
              <Badge colorScheme={r.type==='AC' ? 'purple' : 'orange'}>{r.type}</Badge>
              <Badge>₹{r.type==='AC' ? acRate : nonAcRate}/day</Badge>
            </HStack>
            {r.occupied ? (
              <Badge colorScheme="red">Occupied by {r.currentPatient?.name || 'Patient'}</Badge>
            ) : (
              <Badge colorScheme="green">Available</Badge>
            )}
            <Divider my={2} />
            <Tag colorScheme="purple" mr={1}><FaBed /> Room {r.number}</Tag>
            <Tag colorScheme="blue" mr={1}><FaCalendarAlt /> {r.occupied ? 'Occupied' : 'Available'}</Tag>
            <Button size="sm" mt={3} onClick={() => openModal(r)}>{r.occupied ? 'Manage' : 'Assign'}</Button>
          </Box>
        ))}
      </SimpleGrid>
      {/* Add Room Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Room</ModalHeader>
          <ModalBody>
            <FormControl mb={2} isRequired>
              <FormLabel>Room Number</FormLabel>
              <Input value={newRoom.number} onChange={e => setNewRoom(r => ({ ...r, number: e.target.value }))} />
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Type</FormLabel>
              <Select value={newRoom.type} onChange={e => setNewRoom(r => ({ ...r, type: e.target.value }))}>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleAddRoom} isLoading={loading}>Save</Button>
            <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setRoomDetails(null); }} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Room Details</ModalHeader>
          <ModalBody>
            {roomDetails ? (
              <>
                <Box mb={2}>
                  <Tag colorScheme="teal" mr={2}><FaBed /> Room {roomDetails.number}</Tag>
                  <Tag colorScheme="blue" mr={2}>{roomDetails.type}</Tag>
                  <Tag colorScheme={roomDetails.occupied ? 'red' : 'green'}>{roomDetails.occupied ? 'Occupied' : 'Available'}</Tag>
                  <Tag ml={2}>₹{roomDetails.type==='AC' ? acRate : nonAcRate}/day</Tag>
                </Box>
                <Divider mb={2} />
                <Box mb={2}>
                  <Text fontWeight="bold">Patient Details:</Text>
                  {roomDetails.currentPatient ? (
                    <Box p={2} borderWidth={1} borderRadius="md" mt={1}>
                      <Avatar name={roomDetails.currentPatient.name} mr={2} />
                      <Text>Name: {roomDetails.currentPatient.name}</Text>
                      <Text>Gender: {roomDetails.currentPatient.gender}</Text>
                      <Text>Age: {roomDetails.currentPatient.dob ? Math.floor((Date.now() - new Date(roomDetails.currentPatient.dob)) / (365.25*24*60*60*1000)) : 'N/A'}</Text>
                      <Text>Medical ID: {roomDetails.currentPatient.aadhaar}</Text>
                    </Box>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      <Text>No patient assigned. Assign now:</Text>
                      <FormControl>
                        <FormLabel>Select Patient</FormLabel>
                        <Select placeholder="Select patient" value={assignId} onChange={e=>setAssignId(e.target.value)}>
                          {patients.map(p=>(
                            <option key={p._id} value={p._id}>{p.name} ({p.gender})</option>
                          ))}
                        </Select>
                      </FormControl>
                    </VStack>
                  )}
                </Box>
                <Divider mb={2} />
                <Box mb={2}>
                  <Text fontWeight="bold">Assignment Details:</Text>
                  {roomDetails.assignmentHistory && roomDetails.assignmentHistory.length > 0 ? (
                    <Box>
                      {roomDetails.assignmentHistory.slice(-1).map((a, idx) => (
                        <Box key={idx} p={2} borderWidth={1} borderRadius="md" mt={1}>
                          <Text>Assigned: {a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : 'N/A'}</Text>
                          <Text>Expected Discharge: {a.expectedDischarge ? new Date(a.expectedDischarge).toLocaleDateString() : 'N/A'}</Text>
                          <Text>Actual Discharge: {a.actualDischarge ? new Date(a.actualDischarge).toLocaleDateString() : 'N/A'}</Text>
                          <Text>Doctor: {a.doctor ? a.doctor.name : 'N/A'}</Text>
                          <Text>Nurse: {a.nurse ? a.nurse.name : 'N/A'}</Text>
                          <Text>Previous Room: {a.previousRoom || 'N/A'}</Text>
                        </Box>
                      ))}
                    </Box>
                  ) : <Text>No assignment history.</Text>}
                </Box>
                <Divider mb={2} />
                <Box mb={2}>
                  <Text fontWeight="bold">Billing & Cost:</Text>
                  <Text>Cost per Day: <FaRupeeSign /> {roomDetails.type==='AC' ? acRate : nonAcRate}</Text>
                  {roomDetails.totalCost !== undefined && (
                    <Text>Total Cost: <FaRupeeSign /> {roomDetails.totalCost}</Text>
                  )}
                  <Text>Insurance Status: {roomDetails.insuranceStatus}</Text>
                  <Text>Payment Status: {roomDetails.paymentStatus}</Text>
                </Box>
                <Divider mb={2} />
                <Box mb={2}>
                  <Text fontWeight="bold">Room Features:</Text>
                  <Text>Equipment: {roomDetails.equipment?.join(', ') || 'None'}</Text>
                  <Text>Emergency Button: {roomDetails.emergencyButtonStatus}</Text>
                  <Text>Cleaning Required: {roomDetails.cleaningRequired ? 'Yes' : 'No'}</Text>
                  <Text>Last Cleaned: {roomDetails.lastCleaned ? new Date(roomDetails.lastCleaned).toLocaleDateString() : 'N/A'}</Text>
                  <Text>Next Cleaning: {roomDetails.nextCleaning ? new Date(roomDetails.nextCleaning).toLocaleDateString() : 'N/A'}</Text>
                </Box>
                <Divider mb={2} />
                <Box mb={2}>
                  <Text fontWeight="bold">Visitor Log:</Text>
                  {roomDetails.visitorLog && roomDetails.visitorLog.length > 0 ? (
                    roomDetails.visitorLog.slice(-3).map((v, idx) => (
                      <Text key={idx}>{v.name} at {v.time ? new Date(v.time).toLocaleString() : ''}</Text>
                    ))
                  ) : <Text>No recent visitors.</Text>}
                </Box>
                <Divider mb={2} />
                <Box mb={2}>
                  <Text fontWeight="bold">Actions:</Text>
                  <Button leftIcon={<FaBroom />} size="sm" mr={2}>Mark Cleaning</Button>
                  <Button leftIcon={<FaExclamationTriangle />} size="sm" mr={2}>Report Maintenance</Button>
                  <Button leftIcon={<FaPrint />} size="sm" mr={2}>Print Report</Button>
                  <Button leftIcon={<FaCommentDots />} size="sm" mr={2}>Message Staff</Button>
                </Box>
                <Divider mb={2} />
                <Box mb={2}>
                  <Text fontWeight="bold">Notes & Communication:</Text>
                  {roomDetails.notes && roomDetails.notes.length > 0 ? (
                    roomDetails.notes.slice(-3).map((n, idx) => (
                      <Text key={idx}>{n.staff?.name || 'Staff'}: {n.note}</Text>
                    ))
                  ) : <Text>No notes yet.</Text>}
                  {roomDetails.communication && roomDetails.communication.length > 0 ? (
                    roomDetails.communication.slice(-3).map((c, idx) => (
                      <Text key={idx}>{c.from?.name || 'Staff'} to {c.to?.name || 'Staff'}: {c.message}</Text>
                    ))
                  ) : <Text>No communication yet.</Text>}
                </Box>
                <Divider mb={2} />
                <Box mb={2}>
                  <Text fontWeight="bold">QR Code:</Text>
                  <Tag><FaQrcode /> {roomDetails.qrCode || 'N/A'}</Tag>
                </Box>
              </>
            ) : (
              <Text>Loading details...</Text>
            )}
          </ModalBody>
          <ModalFooter>
            {!selected?.occupied ? (
              <Button colorScheme="teal" mr={3} onClick={handleAssign} isLoading={loading} isDisabled={!assignId}>Assign</Button>
            ) : (
              <>
                <Button colorScheme="orange" variant="outline" mr={3} onClick={handleRelease} isLoading={loading}>Move/Discharge</Button>
              </>
            )}
            <Button onClick={() => { setModalOpen(false); setRoomDetails(null); }}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
