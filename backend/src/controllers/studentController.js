import * as studentRepository from '../models/repositories/studentRepository.js';
import { createStudentSchema, updateStudentSchema } from '../models/validations/studentSchemas.js';

export const getAllStudents = async (req, res) => {
  try {
    const students = await studentRepository.getAllStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await studentRepository.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const createStudent = async (req, res) => {
  try {
    const parsed = createStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const student = await studentRepository.createStudent(parsed.data);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const parsed = updateStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const student = await studentRepository.updateStudent(req.params.id, parsed.data);
    res.json(student);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    await studentRepository.deleteStudent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
