import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Box, Heading, SimpleGrid, Link, Button, HStack, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, Text, Badge, Flex, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { loadRazorpay } from '../utils/loadRazorpay';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function Billing() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ patient: '', doctor: '', appointment: '', items: '', taxPercent: 18, currency: 'INR' });
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchBills = async () => {
    try {
      const r = await api.get('/billing');
      setList(r.data);
      setFilteredList(r.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchBills();
    api.get('/patients').then(r => setPatients(r.data.items || r.data));
    api.get('/doctors').then(r => setDoctors(r.data));
    api.get('/appointments').then(r => setAppointments(r.data));
  }, []);
  
  // Filter bills based on search and filters
  useEffect(() => {
    let filtered = list;
    
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b._id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(b => {
        const billDate = new Date(b.createdAt);
        return billDate.toDateString() === filterDate.toDateString();
      });
    }
    
    setFilteredList(filtered);
  }, [searchQuery, statusFilter, dateFilter, list]);

  const pay = async (billId) => {
    try {
      await loadRazorpay();
      const { data } = await api.post(`/payments/bill/${billId}/checkout`, { gateway: 'Razorpay' });
      if (data.gateway !== 'Razorpay') {
        return toast({ title: 'Payment gateway not configured', status: 'warning' });
      }
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: 'INR',
        name: 'Hospital System',
        description: 'Bill Payment',
        order_id: data.order.id,
        handler: function () {
          toast({ title: 'Payment success! Verify on server via webhook/callback.', status: 'success' });
          fetchBills();
        },
        prefill: {},
        theme: { color: '#0ea5e9' },
      };
      // eslint-disable-next-line no-undef
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      toast({ title: 'Payment initiation failed', status: 'error' });
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const items = form.items.split(',').map(i => {
        const [label, quantity, unitPrice] = i.split('|');
        return { label, quantity: Number(quantity), unitPrice: Number(unitPrice) };
      });
      await api.post('/billing', {
        patient: form.patient,
        doctor: form.doctor,
        appointment: form.appointment,
        items,
        taxPercent: form.taxPercent,
        currency: form.currency,
      });
      toast({ title: 'Bill created!', status: 'success' });
      setModalOpen(false);
      setForm({ patient: '', doctor: '', appointment: '', items: '', taxPercent: 18, currency: 'INR' });
      fetchBills();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to create bill', status: 'error' });
    }
    setLoading(false);
  };

  return (
    <Box p={6}>
      <Heading size="md" mb={4}>Bills ({filteredList.length})</Heading>
      
      {/* Search and Filter Bar */}
      <Flex direction={['column', 'column', 'row']} gap={3} mb={4} align="flex-end" justify="space-between">
        <HStack spacing={3} flex="1" w={['100%', '100%', 'auto']}>
          <InputGroup maxW={['100%', '100%', '300px']}>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search by patient, doctor, ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            placeholder="All Status" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="150px"
            icon={<FaFilter />}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </Select>
          
          <Input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            maxW="200px"
            placeholder="Filter by date"
          />
        </HStack>
        
        <Button colorScheme="teal" onClick={() => setModalOpen(true)}>Create Bill</Button>
      </Flex>
      
      <SimpleGrid columns={[1,2,3]} spacing={4}>
        {filteredList.map((b) => (
          <Box key={b._id} p={4} borderWidth={1} borderRadius="lg" boxShadow="sm" transition="all 0.2s ease" _hover={{ boxShadow: 'xl', transform: 'translateY(-2px)' }}>
            <Heading size="sm" color="teal.500" mb={1}>{b.patient?.name || 'Patient'}</Heading>
            <Text mb={1}>Total: {b.total} {b.currency}</Text>
            <Badge colorScheme={b.status === 'Paid' ? 'green' : 'yellow'}>{b.status}</Badge>
            <HStack mt={3} spacing={3}>
              {b.pdfUrl && <Link href={b.pdfUrl} isExternal color="teal.500">View PDF</Link>}
              {b.status === 'Pending' && (
                <Button size="sm" colorScheme="teal" onClick={() => pay(b._id)}>
                  Pay Now
                </Button>
              )}
            </HStack>
          </Box>
        ))}
      </SimpleGrid>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Bill</ModalHeader>
          <ModalBody>
            <FormControl mb={2} isRequired>
              <FormLabel>Patient</FormLabel>
              <Select value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Doctor</FormLabel>
              <Select value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Appointment</FormLabel>
              <Select value={form.appointment} onChange={e => setForm(f => ({ ...f, appointment: e.target.value }))}>
                <option value="">Select Appointment</option>
                {appointments.map(a => <option key={a._id} value={a._id}>{a.patient?.name} with Dr. {a.doctor?.name} ({new Date(a.start).toLocaleString()})</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Items (label|qty|price, comma separated)</FormLabel>
              <Input value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} placeholder="Consultation|1|500, Blood Test|1|300" />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Tax (%)</FormLabel>
              <Input type="number" value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Currency</FormLabel>
              <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleCreate} isLoading={loading} isDisabled={!form.patient || !form.doctor || !form.items}>Create</Button>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
