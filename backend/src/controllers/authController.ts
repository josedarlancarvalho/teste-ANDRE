import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import pool from '../config/database';
import { ProfileType } from '../types';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, profileType, userData } = req.body;

        // Validação básica
        if (!email || !password || !profileType || !userData) {
            return res.status(400).json({ error: 'Dados incompletos para registro' });
        }

        // Verifica se o usuário já existe
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Cria o usuário
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, profile_type) VALUES ($1, $2, $3) RETURNING id',
            [email, passwordHash, profileType]
        );
        const userId = newUser.rows[0].id;

        // Cria o perfil específico baseado no tipo
        switch (profileType) {
            case 'talent':
                if (!userData.fullName || !userData.interestArea) {
                   return res.status(400).json({ error: 'Dados incompletos para perfil de talento' });
                }
                await pool.query(
                    'INSERT INTO talent_profiles (user_id, full_name, interest_area, portfolio_link, avatar_url) VALUES ($1, $2, $3, $4, $5)',
                    [userId, userData.fullName, userData.interestArea, userData.portfolioLink, userData.avatarUrl]
                );
                break;
            case 'hr':
                 if (!userData.fullName || !userData.company || !userData.cnpj) {
                   return res.status(400).json({ error: 'Dados incompletos para perfil de RH' });
                }
                await pool.query(
                    'INSERT INTO hr_profiles (user_id, full_name, company, cnpj, avatar_url) VALUES ($1, $2, $3, $4, $5)',
                    [userId, userData.fullName, userData.company, userData.cnpj, userData.avatarUrl]
                );
                break;
            case 'manager':
                if (!userData.fullName || !userData.company || !userData.position || !userData.talentSearchArea) {
                   return res.status(400).json({ error: 'Dados incompletos para perfil de gestor' });
                }
                await pool.query(
                    'INSERT INTO manager_profiles (user_id, full_name, company, position, talent_search_area, avatar_url) VALUES ($1, $2, $3, $4, $5, $6)',
                    [userId, userData.fullName, userData.company, userData.position, userData.talentSearchArea, userData.avatarUrl]
                );
                break;
            default:
                // Caso o profileType seja inválido (embora o SQL já restrinja)
                await pool.query('DELETE FROM users WHERE id = $1', [userId]); // Limpa o usuário criado
                return res.status(400).json({ error: 'Tipo de perfil inválido' });
        }

        // Gera o token JWT
        const payload = { id: userId, email, profileType };
        const secret = (process.env.JWT_SECRET || 'default_secret') as Secret;
        // @ts-ignore - Ignorando erro de tipo persistente com expiresIn
        const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        res.status(201).json({
            token,
            user: {
                id: userId,
                email,
                profileType
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, expectedProfileType } = req.body;

        // Validação básica
        if (!email || !password || !expectedProfileType) {
            return res.status(400).json({ error: 'Dados incompletos para login' });
        }

        // Busca o usuário
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verifica a senha
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verifica o tipo de perfil
        if (user.rows[0].profile_type !== expectedProfileType) {
            return res.status(403).json({
                error: `Este login é apenas para ${
                    expectedProfileType === 'talent'
                        ? 'jovens talentos'
                        : expectedProfileType === 'hr'
                        ? 'profissionais de RH'
                        : 'gestores'
                }. Você tentou logar como ${user.rows[0].profile_type}.`
            });
        }

        // Gera o token JWT
        const payload = {
            id: user.rows[0].id,
            email: user.rows[0].email,
            profileType: user.rows[0].profile_type
        };
        const secret = (process.env.JWT_SECRET || 'default_secret') as Secret;
        // @ts-ignore - Ignorando erro de tipo persistente com expiresIn
        const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                profileType: user.rows[0].profile_type
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}; 