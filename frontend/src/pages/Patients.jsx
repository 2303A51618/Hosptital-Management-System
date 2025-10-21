import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Box, Heading, Button, Input, SimpleGrid, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, FormControl, FormLabel, Select, Text, Avatar, Divider, Tag, Tooltip, IconButton, useToast, Flex, InputGroup, InputLeftElement, HStack, Menu, MenuButton, MenuList, MenuItem, Switch, FormLabel as ChakraFormLabel, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Badge, Textarea, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { FaUserMd, FaUserNurse, FaBed, FaRupeeSign, FaCalendarAlt, FaPrint, FaHistory, FaNotesMedical, FaQrcode, FaCommentDots, FaSearch, FaFilter, FaTh, FaList } from 'react-icons/fa';

export default function Patients() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', bloodGroup: '', phone: '', dob: '', gender: '', address: '', emergencyName: '', emergencyPhone: '' });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', dob: '', gender: '', address: '', emergencyName: '', emergencyPhone: '' });
  const [deleteReason, setDeleteReason] = useState('');
  const [sortBy, setSortBy] = useState({ field: 'name', dir: 'asc' });
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get('/patients', { params: { q, page, gender: genderFilter } }).then((r) => {
      setList(r.data.items || []);
      setPages(r.data.pages || 1);
      setTotal(r.data.total || 0);
    });
  }, [q, page, genderFilter]);

  // Load doctors for assignment select
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/doctors');
        setDoctors(r.data || []);
      } catch {}
    })();
  }, []);

  const toast = useToast();
  const handleAdd = async () => {
    setLoading(true);
    if (!form.name || !form.gender || !form.dob) {
      toast({ title: 'Name, Gender, and DOB are required.', status: 'error', duration: 3000 });
      setLoading(false);
      return;
    }
    try {
      await api.post('/patients', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        aadhaar: form.aadhaar,
        dob: form.dob,
        gender: form.gender,
        address: form.address,
        emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone },
      });
      toast({ title: 'Patient added successfully!', status: 'success', duration: 3000 });
      setModalOpen(false);
      setForm({ name: '', email: '', phone: '', aadhaar: '', dob: '', gender: '', address: '', emergencyName: '', emergencyPhone: '' });
      api.get('/patients', { params: { q, page } }).then((r) => {
        setList(r.data.items || []);
        setPages(r.data.pages || 1);
        setTotal(r.data.total || 0);
      });
    } catch {
      toast({ title: 'Failed to add patient.', status: 'error', duration: 3000 });
    }
    setLoading(false);
  };

  const openDetails = async (p) => {
    setSelected(p);
    setDetailsOpen(true);
    try {
      const res = await api.get(`/patients/${p._id}/details`);
      setPatientDetails(res.data);
      const base = res.data || p;
      setEditForm({
        name: base.name || '',
        phone: base.phone || '',
        dob: base.dob ? base.dob.slice(0,10) : '',
        gender: base.gender || '',
        address: base.address || '',
        emergencyName: base.emergencyContact?.name || '',
        emergencyPhone: base.emergencyContact?.phone || '',
        assignedDoctor: base.assignedDoctor?._id || base.assignedDoctor || ''
      });
    } catch {
      const base = p || {};
      setEditForm({
        name: base.name || '',
        phone: base.phone || '',
        dob: base.dob ? base.dob.slice(0,10) : '',
        gender: base.gender || '',
        address: base.address || '',
        emergencyName: base.emergencyContact?.name || '',
        emergencyPhone: base.emergencyContact?.phone || '',
        assignedDoctor: base.assignedDoctor?._id || base.assignedDoctor || ''
      });
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.put(`/patients/${selected._id}`, {
        name: editForm.name,
        phone: editForm.phone,
        dob: editForm.dob,
        gender: editForm.gender,
        address: editForm.address,
        emergencyContact: editForm.emergencyName ? { name: editForm.emergencyName } : undefined,
        assignedDoctor: editForm.assignedDoctor || undefined,
      });
      toast({ title: 'Patient updated', status: 'success' });
      setDetailsOpen(false);
      // refresh list
      const r = await api.get('/patients', { params: { q, page, gender: genderFilter } });
      setList(r.data.items || []);
      setPages(r.data.pages || 1);
      setTotal(r.data.total || 0);
    } catch (e) {
      toast({ title: 'Update failed', description: e?.response?.data?.message || 'Unknown error', status: 'error' });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      // pass optional reason as query so backend may ignore safely
      const reason = deleteReason ? `?reason=${encodeURIComponent(deleteReason)}` : '';
      await api.delete(`/patients/${selected._id}${reason}`);
      toast({ title: 'Patient deleted', status: 'success' });
      setDetailsOpen(false);
      // refresh
      const r = await api.get('/patients', { params: { q, page, gender: genderFilter } });
      setList(r.data.items || []);
      setPages(r.data.pages || 1);
      setTotal(r.data.total || 0);
      setDeleteReason('');
    } catch (e) {
      toast({ title: 'Delete failed', description: e?.response?.data?.message || 'Unknown error', status: 'error' });
    }
    setLoading(false);
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Patients ({total})</Heading>
        <HStack>
          <Button colorScheme="teal" onClick={() => setModalOpen(true)}>Register New Patient</Button>
          <IconButton icon={viewMode === 'card' ? <FaList /> : <FaTh />} onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')} aria-label="Toggle view" />
        </HStack>
      </Flex>
      
      {/* Search and Filters */}
      <Flex gap={4} mb={4} flexWrap="wrap">
        <InputGroup flex="1" minW="250px">
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input placeholder="Search patients by name, phone..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </InputGroup>
        
        <Select placeholder="All Genders" value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }} maxW="200px">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </Select>
      </Flex>
      
      {list.length === 0 ? (
        <Box textAlign="center" color="gray.400" mt={10}>
          <Heading size="sm">No patients found</Heading>
        </Box>
      ) : viewMode === 'card' ? (
        <SimpleGrid columns={[1,2,3]} spacing={4}>
          {list.map((p, idx) => (
            <Box key={p._id} p={4} position="relative" borderWidth={2} borderColor="teal.200" borderRadius="xl" boxShadow="md" bgGradient="linear(to-br, white, teal.50)" transition="all 0.2s" _hover={{ boxShadow: 'xl', transform: 'scale(1.03)', bg: 'teal.25' }} onClick={() => openDetails(p)} cursor="pointer">
              {/* Top-right badge showing room or sequence number */}
              <Badge position="absolute" top={2} right={2} colorScheme={p.room ? 'purple' : 'gray'}>
                {p.room || `#${(page - 1) *  (list.length || 1) + idx + 1}`}
              </Badge>
              <Avatar name={p.name} size="lg" mb={2} />
              <Heading size="sm" color="teal.600" mb={1}>{p.name}</Heading>
              <Text color="gray.700" mb={1}>{p.gender}{p.dob ? `, ${new Date(p.dob).getFullYear() ? (new Date().getFullYear() - new Date(p.dob).getFullYear()) + ' yrs' : ''}` : ''}</Text>
              {p.phone && <Text fontSize="sm" color="gray.500">{p.phone}</Text>}
              {p.address && <Text fontSize="sm" color="gray.500">{p.address}</Text>}
              <Divider my={2} />
              <Tag colorScheme="purple" mr={1}><FaBed /> Room: {p.room ? p.room : 'Not Assigned'}</Tag>
              <Tag colorScheme="orange" mr={1}><FaUserMd /> Doctor: {p.assignedDoctor?.name || p.assignedDoctor || 'Not Assigned'}</Tag>
              <Tag colorScheme="blue" mr={1}><FaCalendarAlt /> Admitted: {(p.admissionDate || p.createdAt) ? new Date(p.admissionDate || p.createdAt).toLocaleDateString() : '—'}</Tag>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Box borderWidth={1} borderRadius="md" overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th cursor="pointer" onClick={() => setSortBy(s => ({ field: 'name', dir: s.field==='name' && s.dir==='asc' ? 'desc' : 'asc' }))}>Name</Th>
                <Th>Gender</Th>
                <Th>Phone</Th>
                <Th>Room</Th>
                <Th>Doctor</Th>
                <Th>Admitted</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[...list].sort((a,b)=>{
                const dir = sortBy.dir === 'asc' ? 1 : -1;
                if (sortBy.field==='name') return a.name.localeCompare(b.name)*dir;
                return 0;
              }).map((p, idx) => (
                <Tr key={p._id} _hover={{ bg: 'gray.50' }}>
                  <Td>{(page-1)*list.length + idx + 1}</Td>
                  <Td>{p.name}</Td>
                  <Td>{p.gender}</Td>
                  <Td>{p.phone || '—'}</Td>
                  <Td>{p.room || 'Not Assigned'}</Td>
                  <Td>{p.assignedDoctor?.name || p.assignedDoctor || 'Not Assigned'}</Td>
                  <Td>{(p.admissionDate || p.createdAt) ? new Date(p.admissionDate || p.createdAt).toLocaleDateString() : '—'}</Td>
                  <Td textAlign="right">
                    <HStack justify="flex-end" spacing={2}>
                      <Button size="xs" onClick={() => openDetails(p)}>View</Button>
                      <Button size="xs" variant="outline" onClick={() => openDetails(p)}>Edit</Button>
                      <Button size="xs" colorScheme="red" variant="ghost" onClick={() => { setSelected(p); setDetailsOpen(true); }}>Delete</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      {/* Pagination */}
      {pages > 1 && (
        <Flex mt={6} justify="center" align="center" gap={2}>
          <Button size="sm" onClick={() => setPage(page - 1)} isDisabled={page === 1}>Prev</Button>
          <Text fontSize="sm">Page {page} of {pages} ({total} patients)</Text>
          <Button size="sm" onClick={() => setPage(page + 1)} isDisabled={page === pages}>Next</Button>
        </Flex>
      )}
      {/* Register Patient Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register Patient</ModalHeader>
          <ModalBody>
            <FormControl mb={2} isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Age</FormLabel>
              <Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Blood Group</FormLabel>
              <Select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Date of Birth</FormLabel>
              <Input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Gender</FormLabel>
              <Select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Phone</FormLabel>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </FormControl>
            {/* Email field removed as requested */}
            {/* Aadhaar field removed as requested */}
            <FormControl mb={2}>
              <FormLabel>Address</FormLabel>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Emergency Contact Name</FormLabel>
              <Input value={form.emergencyName} onChange={e => setForm(f => ({ ...f, emergencyName: e.target.value }))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Emergency Contact Phone</FormLabel>
              <Input value={form.emergencyPhone} onChange={e => setForm(f => ({ ...f, emergencyPhone: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleAdd} isLoading={loading}>Save</Button>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Patient Details/Edit Drawer */}
      <Drawer isOpen={detailsOpen} placement="right" onClose={() => setDetailsOpen(false)} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Edit Patient</DrawerHeader>
          <DrawerBody>
            {selected && (
              <>
                <FormControl mb={3}>
                  <FormLabel>Name</FormLabel>
                  <Input value={editForm.name} onChange={e => setEditForm(f=>({ ...f, name: e.target.value }))} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Phone</FormLabel>
                  <Input value={editForm.phone} onChange={e => setEditForm(f=>({ ...f, phone: e.target.value }))} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input type="date" value={editForm.dob} onChange={e => setEditForm(f=>({ ...f, dob: e.target.value }))} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Gender</FormLabel>
                  <Select value={editForm.gender} onChange={e => setEditForm(f=>({ ...f, gender: e.target.value }))}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Address (optional)</FormLabel>
                  <Input value={editForm.address} onChange={e => setEditForm(f=>({ ...f, address: e.target.value }))} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Emergency Contact Name (optional)</FormLabel>
                  <Input value={editForm.emergencyName} onChange={e => setEditForm(f=>({ ...f, emergencyName: e.target.value }))} />
                </FormControl>
                {/* Removed duplicate contact number per request */}
                <FormControl mb={4}>
                  <FormLabel>Assigned Doctor (optional)</FormLabel>
                  <Select value={editForm.assignedDoctor || ''} onChange={e=>setEditForm(f=>({ ...f, assignedDoctor: e.target.value }))} placeholder="Select doctor">
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>
                    ))}
                  </Select>
                </FormControl>

                <Divider my={4} />
                <FormControl>
                  <FormLabel>Reason for discharge/delete (optional)</FormLabel>
                  <Textarea value={deleteReason} onChange={e=>setDeleteReason(e.target.value)} placeholder="Optional: reason shown in audit logs" />
                </FormControl>
              </>
            )}
          </DrawerBody>
          <DrawerFooter>
            <HStack w="100%" justify="space-between">
              <Button colorScheme="red" variant="outline" onClick={handleDelete} isLoading={loading}>Delete</Button>
              <HStack>
                <Button variant="ghost" onClick={() => setDetailsOpen(false)}>Cancel</Button>
                <Button colorScheme="teal" onClick={handleUpdate} isLoading={loading}>Update</Button>
              </HStack>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
