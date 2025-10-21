import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enIN from 'date-fns/locale/en-IN';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { Box, Heading, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, FormControl, FormLabel, Select, Input, Text, Flex, HStack, InputGroup, InputLeftElement, Badge, ButtonGroup } from '@chakra-ui/react';
import { FaSearch, FaFilter, FaUserMd } from 'react-icons/fa';

const locales = { 'en-IN': enIN };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function Appointments() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [range, setRange] = useState({ start: new Date(), end: new Date(Date.now() + 7 * 24 * 3600 * 1000) });
  const [modalOpen, setModalOpen] = useState(false);
  const [slot, setSlot] = useState({ start: null, end: null });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ doctor: '', patient: '', room: '', notes: '' });
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [view, setView] = useState('week');
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reschedule, setReschedule] = useState({ start: '', end: '' });

  const fetchEvents = useCallback(async () => {
    try {
      const params = { from: range.start.toISOString(), to: range.end.toISOString() };
      const res = await api.get('/appointments', { params });
      const items = res.data.map(a => ({
        id: a._id,
        title: `${a.patient?.name || 'Patient'} with Dr. ${a.doctor?.name || ''}`,
        start: new Date(a.start),
        end: new Date(a.end),
        resource: a,
      }));
      setEvents(items);
      setFilteredEvents(items);
    } catch (err) {
      // silent
    }
  }, [range]);
  
  // Filter events based on search and filters
  useEffect(() => {
    let filtered = events;
    
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.resource.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.resource.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (doctorFilter) {
      filtered = filtered.filter(e => e.resource.doctor?._id === doctorFilter);
    }
    if (patientFilter) {
      filtered = filtered.filter(e => e.resource.patient?._id === patientFilter);
    }
    if (fromDate) {
      const d = new Date(fromDate);
      filtered = filtered.filter(e => e.start >= d);
    }
    if (toDate) {
      const d = new Date(toDate);
      d.setHours(23,59,59,999);
      filtered = filtered.filter(e => e.end <= d);
    }
    
    if (statusFilter) {
      const now = new Date();
      if (statusFilter === 'upcoming') {
        filtered = filtered.filter(e => e.start > now);
      } else if (statusFilter === 'past') {
        filtered = filtered.filter(e => e.end < now);
      } else if (statusFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(e => e.start >= today && e.start < tomorrow);
      }
    }
    
    setFilteredEvents(filtered);
  }, [searchQuery, doctorFilter, statusFilter, patientFilter, fromDate, toDate, events]);


  useEffect(() => {
    fetchEvents();
    // Fetch doctors, patients, rooms for booking form
    (async () => {
      try {
        const [d, p, r] = await Promise.all([
          api.get('/doctors'),
          api.get('/patients'),
          api.get('/rooms'),
        ]);
        setDoctors(d.data);
        setPatients(p.data.items || p.data); // paginated or array
        setRooms(r.data);
      } catch {}
    })();
  }, [fetchEvents]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL, { transports: ['websocket'], withCredentials: true });
    socket.on('appointment:update', () => fetchEvents());
    return () => socket.close();
  }, [fetchEvents]);

  const onRangeChange = (nextRange) => {
    if (Array.isArray(nextRange)) {
      const min = new Date(Math.min(...nextRange.map(d => +d)));
      const max = new Date(Math.max(...nextRange.map(d => +d)));
      setRange({ start: min, end: max });
    } else {
      setRange(nextRange);
    }
  };


  const onSelectSlot = ({ start, end }) => {
    setSlot({ start, end });
    setModalOpen(true);
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      await api.post('/appointments', {
        doctor: form.doctor,
        patient: form.patient,
        room: form.room,
        start: slot.start,
        end: slot.end,
        notes: form.notes,
      });
      toast({ title: 'Appointment booked!', status: 'success' });
      setModalOpen(false);
      setForm({ doctor: '', patient: '', room: '', notes: '' });
      fetchEvents();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to book', status: 'error' });
    }
    setLoading(false);
  };

  const onSelectEvent = (ev) => {
    setSelectedEvent(ev);
    setManageOpen(true);
    setReschedule({ start: ev.start.toISOString().slice(0,16), end: ev.end.toISOString().slice(0,16) });
  };

  const handleCancel = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      await api.put(`/appointments/${selectedEvent.id}`, { status: 'Cancelled' });
      toast({ title: 'Appointment cancelled', status: 'success' });
      setManageOpen(false);
      fetchEvents();
    } catch (e) {
      toast({ title: 'Failed to cancel', status: 'error', description: e?.response?.data?.message });
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      await api.put(`/appointments/${selectedEvent.id}`, { status: 'Completed' });
      toast({ title: 'Marked as completed', status: 'success' });
      setManageOpen(false);
      fetchEvents();
    } catch (e) {
      toast({ title: 'Failed to update', status: 'error', description: e?.response?.data?.message });
    }
    setLoading(false);
  };

  const handleReschedule = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      await api.put(`/appointments/${selectedEvent.id}`, { start: new Date(reschedule.start), end: new Date(reschedule.end) });
      toast({ title: 'Appointment rescheduled', status: 'success' });
      setManageOpen(false);
      fetchEvents();
    } catch (e) {
      toast({ title: 'Failed to reschedule', status: 'error', description: e?.response?.data?.message });
    }
    setLoading(false);
  };

  return (
    <Box p={6}>
      <Heading size="md" mb={4}>Appointments Calendar ({filteredEvents.length})</Heading>
      
      {/* Search and Filter Bar + View toggles */}
      <Flex direction={['column', 'column', 'row']} gap={3} mb={4} align="flex-end">
        <HStack spacing={3} flex="1" w={['100%', '100%', 'auto']}>
          <InputGroup maxW={['100%', '100%', '300px']}>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search appointments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            placeholder="All Doctors" 
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            maxW="200px"
            icon={<FaUserMd />}
          >
            {doctors.map(d => (
              <option key={d._id} value={d._id}>Dr. {d.name}</option>
            ))}
          </Select>
          
          <Select 
            placeholder="All Status" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="150px"
            icon={<FaFilter />}
          >
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </Select>

          <Select
            placeholder="All Patients"
            value={patientFilter}
            onChange={(e)=>setPatientFilter(e.target.value)}
            maxW="200px"
          >
            {patients.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </Select>

          <Input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} maxW="170px" />
          <Input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} maxW="170px" />
        </HStack>
        
        <HStack>
          <ButtonGroup isAttached size="sm" variant="outline">
            <Button onClick={()=>setView('day')} isActive={view==='day'}>Day</Button>
            <Button onClick={()=>setView('week')} isActive={view==='week'}>Week</Button>
            <Button onClick={()=>setView('month')} isActive={view==='month'}>Month</Button>
          </ButtonGroup>
          <Badge colorScheme="blue" fontSize="md" p={2}>
            Showing {filteredEvents.length} of {events.length}
          </Badge>
        </HStack>
      </Flex>
      
      <Box p={3} borderWidth={1} borderRadius="lg" boxShadow="sm" transition="all 0.2s ease" _hover={{ boxShadow: 'xl' }}>
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '70vh' }}
        view={view}
        views={['day','week','month']}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        onRangeChange={onRangeChange}
        onView={setView}
        dayPropGetter={(date)=>{
          const today = new Date();
          if (date.toDateString() === today.toDateString()) {
            return { style: { backgroundColor: 'rgba(56, 178, 172, 0.08)' } }; // teal.400 alpha
          }
          return {};
        }}
        eventPropGetter={(event)=>{
          const now = new Date();
          let style = {};
          const status = event.resource.status;
          if (status==='Cancelled') style = { backgroundColor: '#FED7D7', borderColor: '#FC8181', color: '#742A2A' };
          else if (status==='Completed') style = { backgroundColor: '#C6F6D5', borderColor: '#68D391', color: '#22543D' };
          else if (event.start > now) style = { backgroundColor: '#BEE3F8', borderColor: '#63B3ED', color: '#2A4365' }; // upcoming
          return { style };
        }}
        popup
      />
      </Box>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Book Appointment</ModalHeader>
          <ModalBody>
            <FormControl mb={2} isRequired>
              <FormLabel>Doctor</FormLabel>
              <Select value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Patient</FormLabel>
              <Select value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Room</FormLabel>
              <Select value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r._id} value={r._id}>{r.number} ({r.type})</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Notes</FormLabel>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Reason, symptoms, etc." />
            </FormControl>
            <Text fontSize="sm" mt={2} color="gray.500">{slot.start && slot.end ? `${slot.start.toLocaleString()} - ${slot.end.toLocaleString()}` : ''}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleBook} isLoading={loading} isDisabled={!form.doctor || !form.patient || !form.room}>Book</Button>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Manage existing appointment */}
      <Modal isOpen={manageOpen} onClose={()=>setManageOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Appointment</ModalHeader>
          <ModalBody>
            {selectedEvent && (
              <>
                <Text fontWeight="bold" mb={2}>{selectedEvent.resource?.patient?.name} with Dr. {selectedEvent.resource?.doctor?.name}</Text>
                <Text mb={3}>{selectedEvent.start.toLocaleString()} - {selectedEvent.end.toLocaleString()}</Text>
                <FormControl mb={2}>
                  <FormLabel>Reschedule Start</FormLabel>
                  <Input type="datetime-local" value={reschedule.start} onChange={e=>setReschedule(r=>({ ...r, start: e.target.value }))} />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Reschedule End</FormLabel>
                  <Input type="datetime-local" value={reschedule.end} onChange={e=>setReschedule(r=>({ ...r, end: e.target.value }))} />
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack w="100%" justify="space-between">
              <HStack>
                <Button colorScheme="orange" variant="outline" onClick={handleReschedule} isLoading={loading}>Reschedule</Button>
                <Button colorScheme="green" variant="solid" onClick={handleComplete} isLoading={loading}>Mark Completed</Button>
              </HStack>
              <HStack>
                <Button colorScheme="red" variant="ghost" onClick={handleCancel} isLoading={loading}>Cancel Appointment</Button>
                <Button onClick={()=>setManageOpen(false)}>Close</Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
