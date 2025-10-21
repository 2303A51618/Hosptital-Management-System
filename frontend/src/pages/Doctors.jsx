import { FaCalendarAlt, FaUserMd, FaSearch, FaFilter } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Box, Heading, SimpleGrid, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, VStack, Text, HStack, Badge, useToast, Avatar, Divider, Tag, Flex, InputGroup, InputLeftElement } from '@chakra-ui/react';

export default function Doctors() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', experienceYears: '', fees: '', email: '', phone: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', specialty: '', experienceYears: '', fees: '', email: '', phone: '', availability: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    api.get('/doctors').then((r) => {
      setList(r.data);
      setFilteredList(r.data);
    }); 
  }, []);

  useEffect(() => {
    let filtered = list;
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (specialtyFilter) {
      filtered = filtered.filter(d => d.specialty === specialtyFilter);
    }
    setFilteredList(filtered);
  }, [searchQuery, specialtyFilter, list]);

  const openModal = (doc) => {
    setSelected(doc);
    setForm({
      name: doc.name,
      specialty: doc.specialty,
      experienceYears: doc.experienceYears,
      fees: doc.fees,
      email: doc.email,
      phone: doc.phone,
      availability: doc.availability || [],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/doctors/${selected._id}`, form);
      setModalOpen(false);
      api.get('/doctors').then((r) => setList(r.data));
    } catch {}
    setLoading(false);
  };

  // Simple availability editor: add/remove slots
  const addSlot = () => setForm(f => ({ ...f, availability: [...f.availability, { day: '', slots: [{ start: '', end: '' }] }] }));
  const updateSlot = (i, field, value) => setForm(f => {
    const av = [...f.availability];
    av[i][field] = value;
    return { ...f, availability: av };
  });
  const updateTime = (i, j, field, value) => setForm(f => {
    const av = [...f.availability];
    av[i].slots[j][field] = value;
    return { ...f, availability: av };
  });

  const cardProps = {
    p: 4,
    borderWidth: 1,
    borderRadius: 'lg',
    boxShadow: 'sm',
    transition: 'all 0.2s ease',
    _hover: { boxShadow: 'xl', transform: 'translateY(-2px)' },
  };

  const toast = useToast();
  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialty) {
      toast({ title: 'Name and specialty required.', status: 'error', duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      await api.post('/doctors', newDoctor);
      toast({ title: 'Doctor added successfully!', status: 'success', duration: 3000 });
      setAddModalOpen(false);
      setNewDoctor({ name: '', specialty: '', experienceYears: '', fees: '', email: '', phone: '' });
      api.get('/doctors').then((r) => setList(r.data));
    } catch {
      toast({ title: 'Failed to add doctor.', status: 'error', duration: 3000 });
    }
    setLoading(false);
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Doctors ({filteredList.length})</Heading>
        <Button colorScheme="teal" onClick={() => setAddModalOpen(true)}>Add New Doctor</Button>
      </Flex>
      
      {/* Search and Filters */}
      <Flex gap={4} mb={4} flexWrap="wrap">
        <InputGroup flex="1" minW="250px">
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search doctors by name or specialty..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </InputGroup>
        
        <Select 
          placeholder="All Specialties" 
          value={specialtyFilter} 
          onChange={(e) => setSpecialtyFilter(e.target.value)} 
          maxW="250px"
        >
          {[...new Set(list.map(d => d.specialty))].map(specialty => (
            <option key={specialty} value={specialty}>{specialty}</option>
          ))}
        </Select>
      </Flex>
      
      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {filteredList.map((d) => (
          <Box key={d._id} p={4} borderWidth={2} borderColor="teal.200" borderRadius="xl" boxShadow="md" bgGradient="linear(to-br, white, teal.50)" transition="all 0.2s" _hover={{ boxShadow: 'xl', transform: 'scale(1.03)', bg: 'teal.25' }} onClick={() => openModal(d)} cursor="pointer">
            <Avatar name={d.name} size="lg" mb={2} />
            <Heading size="sm" color="teal.600" mb={1}>{d.name}</Heading>
            <Text color="gray.700" mb={1}>{d.specialty}</Text>
            <HStack spacing={3} flexWrap="wrap" mb={2}>
              {d.experienceYears !== undefined && <Badge colorScheme="purple">{d.experienceYears} yrs</Badge>}
              {d.fees !== undefined && <Badge colorScheme="blue">Fees: ₹{d.fees}</Badge>}
            </HStack>
            {d.email && <Text fontSize="sm" color="gray.500">{d.email}</Text>}
            {d.phone && <Text fontSize="sm" color="gray.500">{d.phone}</Text>}
            <Divider my={2} />
            <Tag colorScheme="orange" mr={1}><FaUserMd /> Doctor</Tag>
            <Tag colorScheme="blue" mr={1}><FaCalendarAlt /> Available</Tag>
          </Box>
        ))}
      </SimpleGrid>
      {/* Add Doctor Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Doctor</ModalHeader>
          <ModalBody>
            <FormControl mb={2} isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={newDoctor.name} onChange={e => setNewDoctor(d => ({ ...d, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Specialty</FormLabel>
              <Input value={newDoctor.specialty} onChange={e => setNewDoctor(d => ({ ...d, specialty: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Experience (years)</FormLabel>
              <Input type="number" value={newDoctor.experienceYears} onChange={e => setNewDoctor(d => ({ ...d, experienceYears: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Fees</FormLabel>
              <Input type="number" value={newDoctor.fees} onChange={e => setNewDoctor(d => ({ ...d, fees: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Email</FormLabel>
              <Input value={newDoctor.email} onChange={e => setNewDoctor(d => ({ ...d, email: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Phone</FormLabel>
              <Input value={newDoctor.phone} onChange={e => setNewDoctor(d => ({ ...d, phone: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleAddDoctor} isLoading={loading}>Save</Button>
            <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Doctor Profile</ModalHeader>
          <ModalBody>
            <FormControl mb={2} isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Specialty</FormLabel>
              <Input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Experience (years)</FormLabel>
              <Input type="number" value={form.experienceYears} onChange={e => setForm(f => ({ ...f, experienceYears: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Fees (INR)</FormLabel>
              <Input type="number" value={form.fees} onChange={e => setForm(f => ({ ...f, fees: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Email</FormLabel>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Phone</FormLabel>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </FormControl>
            <VStack align="start" mt={4} spacing={2}>
              <Text fontWeight="bold">Availability</Text>
              {form.availability.map((a, i) => (
                <Box key={i} p={2} borderWidth={1} borderRadius="md" w="100%">
                  <FormControl mb={1}>
                    <FormLabel>Day</FormLabel>
                    <Select value={a.day} onChange={e => updateSlot(i, 'day', e.target.value)}>
                      <option value="">Select Day</option>
                      <option value="Mon">Mon</option>
                      <option value="Tue">Tue</option>
                      <option value="Wed">Wed</option>
                      <option value="Thu">Thu</option>
                      <option value="Fri">Fri</option>
                      <option value="Sat">Sat</option>
                      <option value="Sun">Sun</option>
                    </Select>
                  </FormControl>
                  {a.slots.map((s, j) => (
                    <HStack key={j}>
                      <FormControl mb={1}>
                        <FormLabel>Start</FormLabel>
                        <Input type="time" value={s.start} onChange={e => updateTime(i, j, 'start', e.target.value)} />
                      </FormControl>
                      <FormControl mb={1}>
                        <FormLabel>End</FormLabel>
                        <Input type="time" value={s.end} onChange={e => updateTime(i, j, 'end', e.target.value)} />
                      </FormControl>
                    </HStack>
                  ))}
                </Box>
              ))}
              <Button size="sm" onClick={addSlot}>Add Day/Slot</Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSave} isLoading={loading}>Save</Button>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
