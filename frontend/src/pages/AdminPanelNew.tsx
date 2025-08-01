import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin';
import type { 
  AdminStats, 
  UserAdmin,
  SubjectAdmin,
  TopicAdmin,
  ExamTypeAdmin, 
  ExamQuestionAdmin,
  PracticeExamAdmin,
  PracticeExamQuestion,
  EducationLevelAdmin,
  UserCreate,
  UserUpdate,
  SubjectCreate,
  SubjectUpdate,
  TopicCreate,
  TopicUpdate,
  ExamTypeCreate,
  ExamTypeUpdate,
  ExamSectionAdmin,
  ExamSectionCreate
} from '../services/admin';

// Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2h-4a2 2 0 01-2-2v0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ClipboardListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AdminPanelNew: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [subjects, setSubjects] = useState<SubjectAdmin[]>([]);
  const [topics, setTopics] = useState<TopicAdmin[]>([]);
  const [examTypes, setExamTypes] = useState<ExamTypeAdmin[]>([]);
  const [questions, setQuestions] = useState<ExamQuestionAdmin[]>([]);
  const [practiceExams, setPracticeExams] = useState<PracticeExamAdmin[]>([]);
  const [selectedExamQuestions, setSelectedExamQuestions] = useState<PracticeExamQuestion[]>([]);
  const [showExamQuestionsModal, setShowExamQuestionsModal] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showCreateExamSectionModal, setShowCreateExamSectionModal] = useState(false);
  const [showEditExamSectionModal, setShowEditExamSectionModal] = useState(false);
  const [showExamDetailsModal, setShowExamDetailsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<PracticeExamAdmin | null>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [loadingExamQuestions, setLoadingExamQuestions] = useState(false);
  const [editingExamSection, setEditingExamSection] = useState<any>(null);
  const [educationLevels, setEducationLevels] = useState<EducationLevelAdmin[]>([]);
  const [examSections, setExamSections] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showExamTypeModal, setShowExamTypeModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [userForm, setUserForm] = useState<UserCreate>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_admin: false
  });
  const [subjectForm, setSubjectForm] = useState<SubjectCreate>({
    name: '',
    description: '',
    education_level_id: 0
  });
  const [topicForm, setTopicForm] = useState<TopicCreate>({
    subject_id: 0,
    name: '',
    description: ''
  });
  const [examTypeForm, setExamTypeForm] = useState<ExamTypeCreate>({
    name: '',
    description: '',
    duration_minutes: undefined,
    education_level_id: 0
  });
  const [createExamForm, setCreateExamForm] = useState({
    exam_type_id: 0,
    exam_section_id: 0,
    user_id: 0,
    question_count: 40,
    use_existing: true,
    force_new: false
  });
  const [createExamSectionForm, setCreateExamSectionForm] = useState({
    name: '',
    exam_type_id: 0,
    course_ids: [] as number[],
    question_count: 10
  });

  // Fetch functions
  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      setError('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      setError('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSubjects();
      console.log('Subjects loaded:', data);
      // API response might be an object with courses array or direct array
      const coursesArray = Array.isArray(data) ? data : ((data as any).courses || (data as any).data || []);
      console.log('Processed courses array:', coursesArray);
      setSubjects(coursesArray);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Error loading subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTopics();
      setTopics(data);
    } catch (error) {
      setError('Konular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamTypes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getExamTypes();
      setExamTypes(data);
    } catch (error) {
      setError('Sınav türleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getQuestions();
      setQuestions(data);
    } catch (error) {
      setError('Sorular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchPracticeExams = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPracticeExams({ limit: 50 });
      setPracticeExams(data);
    } catch (error) {
      setError('Sınavlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchEducationLevels = async () => {
    try {
      console.log('Loading education levels...');
      const data = await adminApi.getEducationLevels();
      console.log('Education levels loaded:', data);
      setEducationLevels(data);
    } catch (error) {
      console.error('Eğitim seviyeleri yüklenirken hata:', error);
      setError('Eğitim seviyeleri yüklenirken hata oluştu: ' + (error as any)?.message || 'Bilinmeyen hata');
    }
  };


  const fetchCourses = async () => {
    try {
      console.log('Loading courses...');
      const data = await adminApi.getSubjects(); // Use subjects as courses
      console.log('Courses loaded:', data);
      // API response might be an object with courses array or direct array
      const coursesArray = Array.isArray(data) ? data : ((data as any).courses || (data as any).data || []);
      setCourses(coursesArray);
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Error loading courses');
    }
  };

  const fetchExamSections = async () => {
    try {
      console.log('Loading exam sections...');
      const data = await adminApi.getExamSections();
      console.log('Exam sections loaded:', data);
      setExamSections(data || []);
    } catch (error) {
      console.error('Sınav bölümleri yüklenirken hata:', error);
      setError('Sınav bölümleri yüklenirken hata oluştu');
    }
  };

  // Fetch exam questions
  const fetchExamQuestions = async (examId: number) => {
    try {
      setLoadingExamQuestions(true);
              console.log('Loading exam questions, exam ID:', examId);
      
      // Make real API call
      const data = await adminApi.getPracticeExamQuestions(examId);
      console.log('Exam questions from API:', data);
      
      // Check API response and convert to proper format
      let questionsData: any[] = [];
      if (Array.isArray(data)) {
        questionsData = data;
      } else if (data && (data as any).questions) {
        questionsData = (data as any).questions;
      } else if (data && (data as any).data) {
        questionsData = (data as any).data;
      } else {
        console.warn('Unexpected API response format:', data);
        questionsData = [];
      }

      console.log('Loaded questions:', questionsData.length);
      
      // Debug: Check if correct_answer field is now present
      if (questionsData.length > 0) {
        const first = questionsData[0];
        console.log('✅ First question correct_answer:', first.correct_answer);
        console.log('✅ First question explanation:', first.explanation);
        if (first.correct_answer) {
          console.log('🎉 SUCCESS: Admin endpoint is now returning correct answers!');
        } else {
          console.log('⚠️ Still no correct_answer field - check backend');
        }
      }

      // Normalize options field for each question
      const normalizedQuestions = questionsData.map(question => {
        let options = question.options || question.option_choices || question.choices || [];
        
        // If options is a string, try to parse it
        if (typeof options === 'string') {
          try {
            options = JSON.parse(options);
          } catch (e) {
            console.warn('Failed to parse options string:', options);
            options = [];
          }
        }

        // If options is still not an array or empty, build from option_a, option_b, etc.
        if (!Array.isArray(options) || options.length === 0) {
          options = [];
          
          // Build options array from individual option fields
          const optionLabels = ['A', 'B', 'C', 'D', 'E'];
          const optionFields = ['option_a', 'option_b', 'option_c', 'option_d', 'option_e'];
          
          optionFields.forEach((fieldName, index) => {
            const optionText = question[fieldName];
            if (optionText && optionText.trim() !== '') {
              // Check if this option is the correct answer (now with backend support)
              const correctAnswer = question.correct_answer;
              const isCorrect = correctAnswer && (
                // Letter matching: 'A', 'B', 'C', 'D', 'E'
                correctAnswer.toUpperCase() === optionLabels[index] ||
                // Number matching: '1', '2', '3', '4', '5' 
                correctAnswer.toString() === (index + 1).toString() ||
                // Direct text match
                correctAnswer.toString().trim().toLowerCase() === optionText.trim().toLowerCase() ||
                // Option field match (option_a, option_b, etc.)
                correctAnswer === fieldName ||
                // Index match (0, 1, 2, 3, 4)
                correctAnswer.toString() === index.toString()
              );
              
              if (isCorrect) {
                console.log(`✅ Found correct answer for question ${question.id}: Option ${optionLabels[index]} = "${optionText}"`);
              }
              
              options.push({
                id: `${question.id}_${optionLabels[index]}`,
                text: optionText.trim(),
                label: optionLabels[index],
                is_correct: isCorrect
              });
            }
          });
        }

        return {
          ...question,
          options: options
        };
      });

      console.log('Questions processed successfully');

      setExamQuestions(normalizedQuestions);
      
    } catch (error) {
      console.error('Error loading exam questions:', error);
              setError('Error loading exam questions: ' + (error as any)?.message);
      
      // Hata durumunda boş dizi set edelim
      setExamQuestions([]);
    } finally {
      setLoadingExamQuestions(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    setError(null);
    switch (activeTab) {
      case 'dashboard':
        fetchStats();
        break;
      case 'users':
        fetchUsers();
        break;
      case 'subjects':
        fetchSubjects();
        fetchEducationLevels(); // Need education levels for grouping and dropdown
        break;
      case 'topics':
        fetchTopics();
        fetchSubjects(); // Need subjects for dropdown
        fetchEducationLevels(); // Need education levels for grouping
        break;
      case 'exam-types':
        fetchExamTypes();
        fetchEducationLevels(); // Need education levels for dropdown
        fetchExamSections(); // Need exam sections to show under each exam type
        break;
      case 'practice-exams':
        fetchPracticeExams();
        fetchUsers(); // Need users for dropdown
        fetchExamTypes(); // Need exam types for dropdown
        fetchExamSections(); // Need real exam sections from database
        fetchCourses(); // Need courses for exam section creation
        break;
    }
  }, [activeTab]);

  // CRUD handlers
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updateUser(editingItem.id, userForm as UserUpdate);
      } else {
        await adminApi.createUser(userForm);
      }
      setShowUserModal(false);
      setEditingItem(null);
      resetUserForm();
      fetchUsers();
    } catch (error) {
      setError('Kullanıcı kaydedilirken hata oluştu');
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        console.log('Updating subject:', subjectForm);
        await adminApi.updateSubject(editingItem.id, subjectForm as SubjectUpdate);
      } else {
        console.log('Creating new subject:', subjectForm);
        await adminApi.createSubject(subjectForm);
      }
      setShowSubjectModal(false);
      setEditingItem(null);
      resetSubjectForm();
      // Verileri yeniden yükle
      await fetchSubjects();
    } catch (error) {
      console.error('Ders kaydedilirken hata:', error);
      setError('Ders kaydedilirken hata oluştu');
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updateTopic(editingItem.id, topicForm as TopicUpdate);
      } else {
        await adminApi.createTopic(topicForm);
      }
      setShowTopicModal(false);
      setEditingItem(null);
      resetTopicForm();
      fetchTopics();
    } catch (error) {
      setError('Konu kaydedilirken hata oluştu');
    }
  };

  const handleExamTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updateExamType(editingItem.id, examTypeForm as ExamTypeUpdate);
      } else {
        await adminApi.createExamType(examTypeForm);
      }
      setShowExamTypeModal(false);
      setEditingItem(null);
      resetExamTypeForm();
      fetchExamTypes();
    } catch (error) {
      setError('Sınav türü kaydedilirken hata oluştu');
    }
  };

  // Exam create handler
  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Seçilen exam section'dan exam_type_id'yi al
      const selectedSection = examSections.find(section => section.id === createExamForm.exam_section_id);
      if (!selectedSection) {
        throw new Error('Seçilen sınav bölümü bulunamadı');
      }

      console.log('Creating exam:', {
        exam_type_id: selectedSection.exam_type_id,
        exam_section_id: createExamForm.exam_section_id,
        user_id: createExamForm.user_id || 1,
        name: `${selectedSection.name} Denemesi`
      });

      // Admin API'sini kullanarak practice exam oluştur
      const result = await adminApi.createPracticeExam({
        exam_type_id: selectedSection.exam_type_id,
        exam_section_id: createExamForm.exam_section_id,
        user_id: createExamForm.user_id || 1, // Varsayılan kullanıcı
        name: `${selectedSection.name} Denemesi`
      });
      
      console.log('Exam created successfully:', result);
      setShowCreateExamModal(false);
      setCreateExamForm({ exam_type_id: 0, exam_section_id: 0, user_id: 0, question_count: 20, use_existing: true, force_new: false });
      await fetchPracticeExams();
    } catch (error) {
      console.error('Sınav oluşturulurken hata:', error);
      setError('Sınav oluşturulurken hata oluştu: ' + (error as any)?.message || 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  // Exam section create handler
  const handleCreateExamSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating exam section:', createExamSectionForm);
      
      // Validasyon
      if (!createExamSectionForm.name) {
        throw new Error('Bölüm adı gerekli');
      }
      if (!createExamSectionForm.exam_type_id) {
        throw new Error('Sınav türü seçilmeli');
      }
      
      // İlk course'u bul (fallback için)
      let courseId = 1; // Varsayılan course_id
      if (courses.length > 0) {
        courseId = courses[0].id;
      }
      
      // API çağrısı
      const response = await adminApi.createExamSection({
        name: createExamSectionForm.name,
        exam_type_id: createExamSectionForm.exam_type_id,
        course_id: courseId,
        question_count: createExamSectionForm.question_count,
        sort_order: 1,
        color: '#4F46E5',
        icon: '📚'
      });
      
              console.log('Exam section created successfully:', response);
      setShowCreateExamSectionModal(false);
      resetExamSectionForm();
      
      // Exam sections listesini yenile
      await fetchExamSections();
      
    } catch (error) {
      console.error('Sınav bölümü oluşturulurken hata:', error);
      throw new Error('Sınav bölümü oluşturulamadı');
    }
  };

  // Exam section edit handler
  const handleEditExamSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
              console.log('Updating exam section:', createExamSectionForm, editingExamSection);
      
      // Validasyon
      if (!createExamSectionForm.name) {
        throw new Error('Bölüm adı gerekli');
      }
      if (!createExamSectionForm.exam_type_id) {
        throw new Error('Sınav türü seçilmeli');
      }
      
      // İlk course'u bul (fallback için)
      let courseId = editingExamSection.course_id || 1;
      if (courses.length > 0) {
        courseId = courses[0].id;
      }
      
      // API çağrısı
      const response = await adminApi.updateExamSection(editingExamSection.id, {
        name: createExamSectionForm.name,
        exam_type_id: createExamSectionForm.exam_type_id,
        course_id: courseId,
        question_count: createExamSectionForm.question_count,
        sort_order: editingExamSection.sort_order || 1,
        color: editingExamSection.color || '#4F46E5',
        icon: editingExamSection.icon || '📚'
      });
      
              console.log('Exam section updated successfully:', response);
      setShowEditExamSectionModal(false);
      setEditingExamSection(null);
      resetExamSectionForm();
      
      // Exam sections listesini yenile
      await fetchExamSections();
      
    } catch (error) {
      console.error('Sınav bölümü güncellenirken hata:', error);
      setError('Sınav bölümü güncellenirken hata oluştu');
    }
  };

  // Handle edit exam section
  const handleEditExamSection = (section: any) => {
    setCreateExamSectionForm({
      name: section.name,
      exam_type_id: section.exam_type_id,
      course_ids: [],
      question_count: section.question_count || section.total_questions || 10
    });
    setEditingExamSection(section);
    setShowEditExamSectionModal(true);
  };

  // Delete handlers
  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      await adminApi.deleteUser(id);
      fetchUsers();
    } catch (error) {
      setError('Kullanıcı silinirken hata oluştu');
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Bu dersi silmek istediğinizden emin misiniz? İlgili tüm konular da silinecek.')) return;
    try {
      await adminApi.deleteSubject(id);
      fetchSubjects();
    } catch (error) {
      setError('Ders silinirken hata oluştu');
    }
  };

  const handleDeleteTopic = async (id: number) => {
    if (!confirm('Bu konuyu silmek istediğinizden emin misiniz?')) return;
    try {
      await adminApi.deleteTopic(id);
      fetchTopics();
    } catch (error) {
      setError('Konu silinirken hata oluştu');
    }
  };

  const handleDeleteExamType = async (id: number) => {
    if (!confirm('Bu sınav türünü silmek istediğinizden emin misiniz? İlgili tüm sorular da silinecek.')) return;
    try {
      await adminApi.deleteExamType(id);
      fetchExamTypes();
    } catch (error) {
      setError('Sınav türü silinirken hata oluştu');
    }
  };

  // Form reset functions
  const resetUserForm = () => {
    setUserForm({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      is_admin: false
    });
  };

  const resetSubjectForm = () => {
    setSubjectForm({
      name: '',
      description: '',
      education_level_id: 0
    });
  };

  const resetTopicForm = () => {
    setTopicForm({
      subject_id: 0,
      name: '',
      description: ''
    });
  };

  const resetExamTypeForm = () => {
    setExamTypeForm({
      name: '',
      description: '',
      duration_minutes: undefined,
      education_level_id: 0
    });
  };

  const resetExamSectionForm = () => {
    setCreateExamSectionForm({
      name: '',
      exam_type_id: 0,
      course_ids: [],
      question_count: 10
    });
  };

  // Handle course selection for exam section
  const handleCourseSelection = (courseId: number, isSelected: boolean) => {
    if (isSelected) {
      setCreateExamSectionForm({
        ...createExamSectionForm,
        course_ids: [...createExamSectionForm.course_ids, courseId]
      });
    } else {
      setCreateExamSectionForm({
        ...createExamSectionForm,
        course_ids: createExamSectionForm.course_ids.filter(id => id !== courseId)
      });
    }
  };

  // Edit handlers
  const handleEditUser = (user: UserAdmin) => {
    setUserForm({
      username: user.email, // Assuming username is email for now
      email: user.email,
      first_name: user.full_name.split(' ')[0] || '',
      last_name: user.full_name.split(' ').slice(1).join(' ') || '',
      password: '', // Don't pre-fill password
      is_admin: user.is_admin
    });
    setEditingItem(user);
    setShowUserModal(true);
  };

  const handleEditSubject = (subject: SubjectAdmin) => {
    console.log('Editing subject:', subject);
    const formData = {
      name: subject.name,
      description: subject.description || '',
      education_level_id: subject.education_level_id || 0
    };
    console.log('Setting form data:', formData);
    setSubjectForm(formData);
    setEditingItem(subject);
    setShowSubjectModal(true);
  };

  const handleEditTopic = (topic: TopicAdmin) => {
    setTopicForm({
      subject_id: topic.subject_id,
      name: topic.name,
      description: topic.description || ''
    });
    setEditingItem(topic);
    setShowTopicModal(true);
  };

  const handleEditExamType = (examType: ExamTypeAdmin) => {
    setExamTypeForm({
      name: examType.name,
      description: examType.description || '',
      duration_minutes: examType.duration_minutes,
      education_level_id: examType.education_level_id || 0
    });
    setEditingItem(examType);
    setShowExamTypeModal(true);
  };

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Toplam Kullanıcı</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_users}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Sınav Türleri</h3>
            <p className="text-3xl font-bold text-green-600">{stats.total_exam_types}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Toplam Soru</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.total_questions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Aylık Sınavlar</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.monthly_exams}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Aktif Kullanıcılar</h3>
            <p className="text-3xl font-bold text-red-600">{stats.active_users}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
        <button
          onClick={() => {
            resetUserForm();
            setEditingItem(null);
            setShowUserModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon />
          Yeni Kullanıcı
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
                            {(users || []).map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.is_admin ? 'Admin' : 'Kullanıcı'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSubjects = () => {
    console.log('Render subjects - subjects:', subjects);
    console.log('Render subjects - educationLevels:', educationLevels);
    
    // Ensure subjects is an array
    if (!Array.isArray(subjects)) {
      console.error('Subjects is not an array:', subjects);
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Ders Yönetimi</h2>
            <button
              onClick={() => {
                resetSubjectForm();
                setEditingItem(null);
                setShowSubjectModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon />
              Yeni Ders
            </button>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500">Dersler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>
          </div>
        </div>
      );
    }
    
    // Group subjects by education level
    const groupedSubjects = subjects.reduce((acc, subject) => {
      const levelId = subject.education_level_id || 0;
      const levelName = educationLevels.find(level => level.id === levelId)?.name || 'Seviye Belirsiz';
      
      console.log(`Subject: ${subject.name}, levelId: ${levelId}, levelName: ${levelName}`);
      
      if (!acc[levelId]) {
        acc[levelId] = {
          name: levelName,
          subjects: []
        };
      }
      acc[levelId].subjects.push(subject);
      return acc;
    }, {} as Record<number, { name: string; subjects: SubjectAdmin[] }>);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Ders Yönetimi</h2>
          <button
            onClick={() => {
              resetSubjectForm();
              setEditingItem(null);
              setShowSubjectModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <PlusIcon />
            Yeni Ders
          </button>
        </div>

        {Object.entries(groupedSubjects).map(([levelId, group]) => (
          <div key={levelId} className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {group.name}
                </span>
                <span className="text-sm text-gray-500">({group.subjects.length} ders)</span>
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {(group.subjects || []).map((subject) => (
                <div key={subject.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{subject.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{subject.description || 'Açıklama yok'}</p>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{subject.topics_count}</span> konu
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {subjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz ders eklenmemiş.</p>
          </div>
        )}
      </div>
    );
  };

  const renderTopics = () => {
    // Group topics by education level (based on subject's education level)
    const groupedTopics = topics.reduce((acc, topic) => {
      // Find the subject to get its education level
      const subject = subjects.find(s => s.id === topic.subject_id);
      const levelId = subject?.education_level_id || 0;
      const levelName = educationLevels.find(level => level.id === levelId)?.name || 'Seviye Belirsiz';
      
      if (!acc[levelId]) {
        acc[levelId] = {
          name: levelName,
          topics: []
        };
      }
      acc[levelId].topics.push(topic);
      return acc;
    }, {} as Record<number, { name: string; topics: TopicAdmin[] }>);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Konu Yönetimi</h2>
          <button
            onClick={() => {
              resetTopicForm();
              setEditingItem(null);
              setShowTopicModal(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <PlusIcon />
            Yeni Konu
          </button>
        </div>

        {Object.entries(groupedTopics).map(([levelId, group]) => (
          <div key={levelId} className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {group.name}
                </span>
                <span className="text-sm text-gray-500">({group.topics.length} konu)</span>
              </h3>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                                      {(group.topics || []).map((topic) => (
                    <tr key={topic.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {topic.subject_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{topic.description || 'Açıklama yok'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditTopic(topic)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz konu eklenmemiş.</p>
          </div>
        )}
      </div>
    );
  };

  const renderExamTypes = () => {
    // Group exam sections by exam type
          const examTypesWithSections = (examTypes || []).map(examType => {
      const relatedSections = examSections.filter(section => section.exam_type_id === examType.id);
      return {
        ...examType,
        sections: relatedSections
      };
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Sınav Türü Yönetimi</h2>
          <button
            onClick={() => {
              resetExamTypeForm();
              setEditingItem(null);
              setShowExamTypeModal(true);
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <PlusIcon />
            Yeni Sınav Türü
          </button>
        </div>

        <div className="space-y-6">
          {examTypesWithSections.map((examType) => (
            <div key={examType.id} className="bg-white rounded-lg shadow">
              {/* Exam Type Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{examType.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{examType.description || 'Açıklama yok'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditExamType(examType)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Düzenle"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDeleteExamType(examType.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Sil"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Süre: {examType.duration_minutes || 'Belirsiz'} dk
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {examType.sections.length} bölüm
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    examType.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {examType.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              {/* Exam Sections */}
              {examType.sections.length > 0 ? (
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Sınav Bölümleri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(examType.sections || []).map((section) => {
                      // Derlenen başlık: "TYT • Türkçe" gibi
                      const examTypeLabel = examType.name || section.exam_type_name || '';
                      const sectionLabel = section.name || '';
                      const composedName = examTypeLabel && sectionLabel
                        ? `${examTypeLabel} • ${sectionLabel}`
                        : sectionLabel || examTypeLabel || 'Bölüm';

                      // Soru sayısı kaynağı (DB alanı -> fallback alanı -> varsayılan)
                      const questionCount = section.question_count ?? section.total_questions ?? 10;

                      return (
                        <div key={section.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{section.icon || '📚'}</span>
                              <div>
                                <h5 className="font-semibold text-gray-900 text-sm">
                                  {composedName}
                                </h5>
                                <p className="text-xs text-gray-600 mt-1">
                                  {questionCount} soru
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEditExamSection(section)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Düzenle"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Bu sınav bölümünü silmek istediğinizden emin misiniz?')) {
                                    adminApi.deleteExamSection(section.id).then(() => {
                                      fetchExamSections();
                                    }).catch(error => {
                                      console.error('Sınav bölümü silinirken hata:', error);
                                      setError('Sınav bölümü silinirken hata oluştu');
                                    });
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Sil"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="bg-white px-2 py-1 rounded-full">
                              ID: {section.id}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${section.color ? 'text-white' : 'bg-gray-100 text-gray-700'}`} style={{ backgroundColor: section.color || '#6B7280' }}>
                              {examTypeLabel || 'Bölüm'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm">Bu sınav türü için henüz bölüm oluşturulmamış.</p>
                  <p className="text-xs mt-1">"Üretilen Sınavlar" sekmesinden yeni bölüm oluşturabilirsiniz.</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {examTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz sınav türü eklenmemiş.</p>
          </div>
        )}
      </div>
    );
  };

  const renderQuestions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Soru Yönetimi</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Soru</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bölüm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zorluk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(questions || []).map((question) => (
              <tr key={question.id}>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{question.question_text.substring(0, 100)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {question.section_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{question.difficulty_level || 'Belirsiz'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => adminApi.deleteQuestion(question.id).then(() => fetchQuestions())}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPracticeExams = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sınav Yönetimi</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCreateExamSectionModal(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <PlusIcon />
            Sınav Bölümü Oluştur
          </button>
          <button
            onClick={() => {
              setCreateExamForm({ exam_type_id: 0, exam_section_id: 0, user_id: 0, question_count: 20, use_existing: true, force_new: false });
              setShowCreateExamModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <PlusIcon />
            Yeni Sınav Oluştur
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sınav</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tür</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(practiceExams || []).map((exam) => (
              <tr key={exam.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                  <div className="text-sm text-gray-500">{exam.total_questions} soru</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{exam.user_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {exam.exam_type_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                    exam.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exam.status === 'completed' ? 'Tamamlandı' :
                     exam.status === 'in_progress' ? 'Devam Ediyor' : 'Başlanmadı'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {exam.score !== null && exam.score !== undefined ? `${exam.score}%` : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(exam.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      fetchExamQuestions(exam.id);
                      setShowExamDetailsModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="İçeriği Görüntüle"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu sınavı silmek istediğinizden emin misiniz?')) {
                        adminApi.deletePracticeExam(exam.id).then(() => fetchPracticeExams());
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {practiceExams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz sınav oluşturulmamış.</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: DashboardIcon },
    { id: 'users', name: 'Kullanıcılar', icon: UsersIcon },
    { id: 'subjects', name: 'Dersler', icon: BookIcon },
    { id: 'topics', name: 'Konular', icon: TagIcon },
    { id: 'exam-types', name: 'Sınav Türleri', icon: ClipboardListIcon },
    { id: 'practice-exams', name: 'Üretilen Sınavlar', icon: FileTextIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">EduAI platform yönetim dashboard'u</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg shadow p-1">
            {(tabs || []).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <div>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'subjects' && renderSubjects()}
            {activeTab === 'topics' && renderTopics()}
            {activeTab === 'exam-types' && renderExamTypes()}
            {activeTab === 'questions' && renderQuestions()}
            {activeTab === 'practice-exams' && renderPracticeExams()}
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
              </h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad</label>
                  <input
                    type="text"
                    value={userForm.first_name}
                    onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soyad</label>
                  <input
                    type="text"
                    value={userForm.last_name}
                    onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  />
                </div>
                {!editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Şifre</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                      required
                    />
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userForm.is_admin}
                    onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Admin yetkisi</label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {editingItem ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingItem(null);
                      resetUserForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Subject Modal */}
        {showSubjectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Ders Düzenle' : 'Yeni Ders'}
              </h3>
              <form onSubmit={handleSubjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ders Adı</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    value={subjectForm.description}
                    onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Eğitim Seviyesi</label>
                  <select
                    value={subjectForm.education_level_id}
                    onChange={(e) => setSubjectForm({ ...subjectForm, education_level_id: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  >
                    <option value={0}>Eğitim seviyesi seçin</option>
                    {(educationLevels || []).map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    {editingItem ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubjectModal(false);
                      setEditingItem(null);
                      resetSubjectForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Topic Modal */}
        {showTopicModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Konu Düzenle' : 'Yeni Konu'}
              </h3>
              <form onSubmit={handleTopicSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ders</label>
                  <select
                    value={topicForm.subject_id}
                    onChange={(e) => setTopicForm({ ...topicForm, subject_id: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  >
                    <option value={0}>Ders seçin</option>
                    {(subjects || []).map((subject) => {
                      const educationLevelName = educationLevels.find(level => level.id === subject.education_level_id)?.name || 'Seviye Belirsiz';
                      return (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({educationLevelName})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Konu Adı</label>
                  <input
                    type="text"
                    value={topicForm.name}
                    onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                  >
                    {editingItem ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTopicModal(false);
                      setEditingItem(null);
                      resetTopicForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Exam Type Modal */}
        {showExamTypeModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Sınav Türü Düzenle' : 'Yeni Sınav Türü'}
              </h3>
              <form onSubmit={handleExamTypeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sınav Türü Adı</label>
                  <input
                    type="text"
                    value={examTypeForm.name}
                    onChange={(e) => setExamTypeForm({ ...examTypeForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    value={examTypeForm.description}
                    onChange={(e) => setExamTypeForm({ ...examTypeForm, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Süre (dakika)</label>
                  <input
                    type="number"
                    value={examTypeForm.duration_minutes || ''}
                    onChange={(e) => setExamTypeForm({ 
                      ...examTypeForm, 
                      duration_minutes: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Eğitim Seviyesi</label>
                  <select
                    value={examTypeForm.education_level_id}
                    onChange={(e) => setExamTypeForm({ ...examTypeForm, education_level_id: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  >
                    <option value={0}>Eğitim seviyesi seçin</option>
                    {(educationLevels || []).map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
                  >
                    {editingItem ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExamTypeModal(false);
                      setEditingItem(null);
                      resetExamTypeForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Exam Modal */}
        {showCreateExamModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Yeni Sınav Oluştur
              </h3>
              <form onSubmit={handleCreateExamSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sınav Bölümü Seçin</label>
                  <select
                    value={createExamForm.exam_section_id}
                    onChange={(e) => setCreateExamForm({ ...createExamForm, exam_section_id: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  >
                    <option value={0}>Sınav bölümü seçin</option>
                    {(examSections || []).map((section) => {
                      const examTypeName = section.exam_type_name || '';
                      const sectionName = section.name || '';
                      const label = examTypeName && sectionName ? `${examTypeName} • ${sectionName}` : (sectionName || examTypeName || 'Bölüm');
                      const qCount = section.question_count ?? section.total_questions ?? 10;
                      return (
                        <option key={section.id} value={section.id}>
                          {label} ({qCount} soru)
                        </option>
                      );
                    })}
                  </select>
                  {examSections.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
                      Sınav bölümleri yüklenemedi. Lütfen sayfayı yenileyin.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createExamForm.exam_section_id === 0 || loading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sınav Oluşturuluyor...
                      </>
                    ) : (
                      'Sınav Oluştur'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateExamModal(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Exam Section Modal */}
        {showCreateExamSectionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">
                Yeni Sınav Bölümü Oluştur
              </h3>
              <form onSubmit={handleCreateExamSectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sınav Bölümü Adı</label>
                  <input
                    type="text"
                    value={createExamSectionForm.name}
                    onChange={(e) => setCreateExamSectionForm({ ...createExamSectionForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    placeholder="Örn: YKS Matematik Bölümü"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sınav Türü</label>
                  <select
                    value={createExamSectionForm.exam_type_id}
                    onChange={(e) => setCreateExamSectionForm({ ...createExamSectionForm, exam_type_id: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  >
                    <option value={0}>Sınav türü seçin</option>
                    {(examTypes || []).map((examType) => (
                      <option key={examType.id} value={examType.id}>
                        {examType.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soru Sayısı</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={createExamSectionForm.question_count}
                    onChange={(e) => setCreateExamSectionForm({ ...createExamSectionForm, question_count: parseInt(e.target.value) || 10 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    placeholder="Örn: 10"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Bu bölümde kaç soru olacağını belirtin</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createExamSectionForm.exam_type_id === 0 || !createExamSectionForm.name.trim()}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Sınav Bölümü Oluştur
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateExamSectionModal(false);
                      resetExamSectionForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Exam Section Modal */}
        {showEditExamSectionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">
                Sınav Bölümü Düzenle
              </h3>
              <form onSubmit={handleEditExamSectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sınav Bölümü Adı</label>
                  <input
                    type="text"
                    value={createExamSectionForm.name}
                    onChange={(e) => setCreateExamSectionForm({ ...createExamSectionForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    placeholder="Örn: YKS Matematik Bölümü"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sınav Türü</label>
                  <select
                    value={createExamSectionForm.exam_type_id}
                    onChange={(e) => setCreateExamSectionForm({ ...createExamSectionForm, exam_type_id: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    required
                  >
                    <option value={0}>Sınav türü seçin</option>
                    {(examTypes || []).map((examType) => (
                      <option key={examType.id} value={examType.id}>
                        {examType.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soru Sayısı</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={createExamSectionForm.question_count}
                    onChange={(e) => setCreateExamSectionForm({ ...createExamSectionForm, question_count: parseInt(e.target.value) || 10 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    placeholder="Örn: 10"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Bu bölümde kaç soru olacağını belirtin</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createExamSectionForm.exam_type_id === 0 || !createExamSectionForm.name.trim()}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Sınav Bölümü Güncelle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditExamSectionModal(false);
                      setEditingExamSection(null);
                      resetExamSectionForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Exam Details Modal */}
        {showExamDetailsModal && selectedExam && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedExam.name}</h3>
                    <div className="flex items-center gap-4 text-indigo-100">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {selectedExam.user_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(selectedExam.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {selectedExam.total_questions} soru
                      </span>
                      {selectedExam.score !== null && selectedExam.score !== undefined && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {selectedExam.score}% puan
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowExamDetailsModal(false);
                      setSelectedExam(null);
                      setExamQuestions([]);
                    }}
                    className="text-white hover:text-gray-200 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {loadingExamQuestions ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Sorular yükleniyor...</span>
                  </div>
                ) : examQuestions.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Sınav Bilgileri</h4>
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-gray-500">Toplam Soru</div>
                          <div className="text-2xl font-bold text-blue-600">{examQuestions.length}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-gray-500">Sınav Türü</div>
                          <div className="text-lg font-medium text-gray-900">{selectedExam?.exam_type_name || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Sınav Soruları</h4>
                      <div className="space-y-6">
                        {(examQuestions || []).map((question, index) => (
                          <div key={question.id} className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                                  Soru {index + 1}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  question.difficulty_level === 'Kolay' ? 'bg-green-100 text-green-800' :
                                  question.difficulty_level === 'Orta' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {question.difficulty_level}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {question.topic_name}
                                </span>
                              </div>

                            </div>

                            <div className="mb-4">
                              <p className="text-gray-900 font-medium mb-3">{question.question_text}</p>
                            </div>



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              {(question.options || []).map((option: any, optionIndex: number) => (
                                <div key={option.id || optionIndex} className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-600">
                                        {String.fromCharCode(65 + optionIndex)}
                                      </span>
                                    </div>
                                    <span className="text-sm text-gray-700">
                                      {option.text || option.option_text || option.content}
                                    </span>
                                    {option.is_correct && (
                                      <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        Doğru Cevap
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {question.explanation && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 mb-1">Açıklama:</p>
                                    <p className="text-sm text-blue-700">{question.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">Bu sınav için soru bilgisi bulunamadı.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowExamDetailsModal(false);
                    setSelectedExam(null);
                    setExamQuestions([]);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelNew;
