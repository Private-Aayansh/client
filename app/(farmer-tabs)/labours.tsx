import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, Filter, SquarePlus as PlusSquare, Trash2, MapPin, Calendar, Users, DollarSign, Clock, Star, Briefcase, TrendingUp } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiClient } from '../../utils/api';
import { Job } from '../../types/job';

const { width } = Dimensions.get('window');

export default function FarmerLabours() {
  const { t } = useLanguage();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const fetchedJobs = await apiClient.getJobs();
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      Alert.alert(t('errors.fetchErrorTitle'), t('errors.fetchErrorMessage'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const handleDeleteJob = async (job: Job) => {
    Alert.alert(
      t('jobCard.deleteConfirmationTitle'),
      `${t('jobCard.deleteConfirmationMessage')}\n\nJob: "${job.title}"`,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          onPress: async () => {
            try {
              await apiClient.deleteJob(job.id);
              setJobs(jobs.filter(j => j.id !== job.id));
              Alert.alert(t('jobCard.deleteSuccessTitle'), t('jobCard.deleteSuccessMessage'));
            } catch (error) {
              console.error('Failed to delete job:', error);
              Alert.alert(t('errors.deleteErrorTitle'), t('errors.deleteErrorMessage'));
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return '#22C55E'; // Active
      case 2: return '#F59E0B'; // In Progress
      case 3: return '#6B7280'; // Completed
      case 0: return '#EF4444'; // Cancelled
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Active';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      case 0: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('dashboard.farmer.labours')}</Text>
          <Text style={styles.subtitle}>Manage your job postings</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.jobList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Briefcase size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>No jobs posted yet</Text>
            <Text style={styles.emptySubtext}>{t('jobList.noJobs.subtitle')}</Text>
            <TouchableOpacity 
              style={styles.emptyAction}
              onPress={() => router.push('/create-job-modal')}
            >
              <Text style={styles.emptyActionText}>Create Your First Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.cardGradient} />
              <View style={styles.jobCardHeader}>
                <View style={styles.jobTitleSection}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(job.status) }
                  ]}>
                    <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDeleteJob(job)} 
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <Text style={styles.jobDescription} numberOfLines={2}>{job.description}</Text>

              <View style={styles.jobMetrics}>
                <View style={styles.metricItem}>
                  <View style={styles.metricIcon}>
                    <DollarSign size={14} color="#22C55E" />
                  </View>
                  <Text style={styles.metricValue}>₹{job.daily_wage}</Text>
                  <Text style={styles.metricLabel}>per day</Text>
                </View>
                <View style={styles.metricItem}>
                  <View style={styles.metricIcon}>
                    <Users size={14} color="#3B82F6" />
                  </View>
                  <Text style={styles.metricValue}>{job.number_of_labourers}</Text>
                  <Text style={styles.metricLabel}>labourers</Text>
                </View>
              </View>

              <View style={styles.jobDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{job.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={14} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {formatDate(job.start_date)}
                    {job.end_date && ` - ${formatDate(job.end_date)}`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.detailText}>
                    Starts at {formatTime(job.start_date)}
                  </Text>
                </View>
              </View>

              {job.required_skills && job.required_skills.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={styles.skillsLabel}>Required Skills:</Text>
                  <View style={styles.skillsContainer}>
                    {job.required_skills.slice(0, 3).map((skill, index) => (
                      <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                    {job.required_skills.length > 3 && (
                      <View style={styles.skillBadge}>
                        <Text style={styles.skillText}>+{job.required_skills.length - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {job.perks && job.perks.length > 0 && (
                <View style={styles.perksSection}>
                  <Star size={14} color="#F59E0B" />
                  <Text style={styles.perksText}>{job.perks.join(' • ')}</Text>
                </View>
              )}

              <View style={styles.jobFooter}>
                <Text style={styles.jobId}>Job #{job.id}</Text>
                <Text style={styles.postedDate}>
                  Posted {job.created_at ? formatDate(job.created_at) : 'recently'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/create-job-modal')}>
        <PlusSquare size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  searchButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  jobList: {
    flex: 1,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 17,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyAction: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    right: 24,
    bottom: 24,
    backgroundColor: '#22C55E',
    borderRadius: 34,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  jobCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
    transform: [{ translateX: 20 }, { translateY: -20 }],
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobTitleSection: {
    flex: 1,
    marginRight: 16,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    lineHeight: 28,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  jobDescription: {
    fontSize: 17,
    color: '#64748B',
    lineHeight: 26,
    marginBottom: 20,
    fontWeight: '500',
  },
  jobMetrics: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  jobDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#64748B',
    flex: 1,
    fontWeight: '500',
  },
  skillsSection: {
    marginBottom: 20,
  },
  skillsLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  skillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0369A1',
  },
  perksSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  perksText: {
    fontSize: 15,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  jobId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postedDate: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});