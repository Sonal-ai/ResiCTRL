import * as studentRepository from '../models/repositories/studentRepository.js';
import { createStudentSchema, updateStudentSchema } from '../models/validations/studentSchemas.js';

export const getAllStudents = async (req, res, next) => {
  try {
    const students = await studentRepository.getAllStudents();
    res.json(students);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await studentRepository.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const parsed = createStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const student = await studentRepository.createStudent(parsed.data);
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const parsed = updateStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const student = await studentRepository.updateStudent(req.params.id, parsed.data);
    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    await studentRepository.deleteStudent(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
