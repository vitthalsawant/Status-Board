import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import GoogleSignIn from '../components/GoogleSignIn';
import useAuth from '../hooks/useAuth';
import { getErrorMessage } from '../api/axios';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const name = form.name.trim();

    if (!name) nextErrors.name = 'Name is required';
    else if (name.length < 2) nextErrors.name = 'Name must be at least 2 characters';
    else if (name.length > 50) nextErrors.name = 'Name cannot exceed 50 characters';

    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = 'Enter a valid email';

    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';

    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await register({ name, email: form.email.trim(), password: form.password });
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not create your account'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async (credential) => {
    setSubmitting(true);
    try {
      const result = await loginWithGoogle(credential);
      toast.success(result.created ? 'Account created' : 'Welcome back');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Google sign-in failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start a private board in less than a minute."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <GoogleSignIn onCredential={handleGoogle} disabled={submitting} />
      <div className="auth__divider">or</div>
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <Input
          id="register-name"
          name="name"
          label="Name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Ada Lovelace"
        />
        <Input
          id="register-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
        />
        <Input
          id="register-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="At least 6 characters"
          trailing={
            <button
              type="button"
              className="field__toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Input
          id="register-confirm"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Repeat your password"
        />
        <Button type="submit" className="btn--block" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
