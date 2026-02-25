import { useState, useEffect, useCallback } from 'react';
import projectService from '../services/projectService';

const useProjects = (params = {}) => {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [pagination, setPagination] = useState({});

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await projectService.getAll(params);
      setProjects(data.data.projects);
      setPagination(data.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async (projectData) => {
    const { data } = await projectService.create(projectData);
    setProjects(prev => [data.data.project, ...prev]);
    return data.data.project;
  };

  const updateProject = async (id, updates) => {
    const { data } = await projectService.update(id, updates);
    setProjects(prev => prev.map(p => p._id === id ? data.data.project : p));
    return data.data.project;
  };

  const deleteProject = async (id) => {
    await projectService.delete(id);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  const addMember = async (id, memberData) => {
    const { data } = await projectService.addMember(id, memberData);
    setProjects(prev => prev.map(p => p._id === id ? data.data.project : p));
    return data.data.project;
  };

  const removeMember = async (id, userId) => {
    const { data } = await projectService.removeMember(id, userId);
    setProjects(prev => prev.map(p => p._id === id ? data.data.project : p));
    return data.data.project;
  };

  return {
    projects,
    loading,
    error,
    pagination,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
  };
};

export default useProjects;