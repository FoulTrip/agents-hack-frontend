"use client"

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User, Mail, Shield, Save, Loader2, Camera,
  Key, Lock, Eye, EyeOff, CheckCircle2, Chrome,
  Settings, Pencil, Fingerprint
} from "lucide-react";
import { uploadToCloudinary } from "../lib/cloudinary";
import DashboardLayout from "../dashboard_layout";

export default function PreferencesPage() {
  const { data: session, update } = useSession();
  const accessToken = (session as any)?.accessToken;

  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef              = React.useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name:   session?.user?.name  || "",
    email:  session?.user?.email || "",
    role:   "Developer",
    bio:    "Building amazing autonomous systems with TripKode.",
    avatar: session?.user?.image || "",
    googleAvatar: "",
    avatarType: "custom",
    language: "es",
  });

  const [security, setSecurity] = useState({
    currentPassword:  "",
    newPassword:      "",
    confirmPassword:  "",
  });

  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd,     setShowNewPwd]     = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name:   prev.name   || session.user?.name  || "",
        email:  prev.email  || session.user?.email || "",
        avatar: prev.avatar || session.user?.image || "",
      }));
    }
  }, [session]);

  useEffect(() => {
    async function fetchProfile() {
      if (!accessToken) return;
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const resp = await fetch(`${apiUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setProfile(prev => ({
            ...prev,
            ...data,
            name:   data.name   || prev.name   || "",
            email:  data.email  || prev.email  || "",
            avatar: data.avatar || prev.avatar || "",
            googleAvatar: data.googleAvatar || "",
            avatarType: data.avatarType || "custom",
            bio:    data.bio    || prev.bio    || "",
            role:   data.role   || prev.role   || "Developer",
            language: data.language || prev.language || "es",
          }));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchProfile();
  }, [accessToken]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const imageUrl      = await uploadToCloudinary(file);
      const updatedProfile = { ...profile, avatar: imageUrl, avatarType: "custom" };
      setProfile(updatedProfile);
      await update({ image: imageUrl });
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/user/profile`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify(updatedProfile),
      });
      setSuccess("Foto de perfil actualizada correctamente.");
    } catch (err: any) {
      setError(err.message || "Error al subir la imagen.");
    } finally { setUploading(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/profile`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify(profile),
      });
      if (resp.ok) {
        setSuccess("Perfil actualizado con éxito.");
        await update({ name: profile.name, image: profile.avatarType === "google" ? profile.googleAvatar : profile.avatar });
      } else {
        const err = await resp.json();
        setError(err.detail || "Error al actualizar el perfil.");
      }
    } catch { setError("Error de conexión con el servidor."); }
    finally { setSaving(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setError("Las contraseñas no coinciden."); return;
    }
    setSavingPwd(true); setError(null); setSuccess(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify({
          current_password: security.currentPassword,
          new_password:     security.newPassword,
        }),
      });
      if (resp.ok) {
        setSuccess("Contraseña actualizada con éxito.");
        setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await resp.json();
        setError(err.detail || "Error al actualizar la contraseña.");
      }
    } catch { setError("Error de conexión con el servidor."); }
    finally { setSavingPwd(false); }
  };

  /* ─────────────────────────────────────────── shared input class ── */
  const inputCls = `
    w-full h-9 px-3 rounded-lg text-[13px] font-medium
    bg-[#F7F7F5] dark:bg-[#1A1A18]
    border border-[#E8E8E4] dark:border-[#2A2A26]
    text-[#1A1A18] dark:text-[#F0EFE9]
    placeholder:text-[#B0B0A8] dark:placeholder:text-[#4A4A44]
    focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]/30 focus:border-[#4F9CF9]
    transition-all duration-150
  `;

  const labelCls = "text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]";

  const sectionCls = `
    rounded-xl border border-[#E8E8E4] dark:border-[#252522]
    bg-white dark:bg-[#141413]
    p-6 space-y-5
  `;

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
              Preferencias
            </h1>
            <p className="text-[13px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5">
              Gestiona tu identidad y configuración de acceso.
            </p>
          </div>
        </div>

        {/* ── Section label ── */}
        <div className="flex items-center gap-2">
          <Settings size={14} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">
            Configuración de cuenta
          </span>
        </div>

        {/* ── Status messages ── */}
        {(error || success) && (
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border text-[12px] font-medium
            ${error
              ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
              : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            }
          `}>
            {error
              ? <Shield size={13} strokeWidth={1.8} />
              : <CheckCircle2 size={13} strokeWidth={1.8} />
            }
            {error || success}
          </div>
        )}

        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 size={20} strokeWidth={1.8} className="animate-spin text-[#B0B0A8] dark:text-[#4A4A44]" />
          </div>
        ) : (
          <div className="space-y-4">

            {/* ════════════════════════ PROFILE ════════════════════════ */}
            <div className={sectionCls}>

              {/* section header */}
              <div className="flex items-center gap-2 pb-1 border-b border-[#F0F0EC] dark:border-[#1E1E1C]">
                <Pencil size={12} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                <span className={labelCls}>Detalles del perfil</span>
              </div>

              {/* Avatar row */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative shrink-0">
                  <div className="
                    w-14 h-14 rounded-xl overflow-hidden
                    bg-[#F0F0EC] dark:bg-[#1E1E1C]
                    border border-[#E8E8E4] dark:border-[#252522]
                    flex items-center justify-center
                  ">
                    {profile.avatarType === 'google' && profile.googleAvatar ? (
                      <img src={profile.googleAvatar} alt="Google Avatar" className="w-full h-full object-cover" />
                    ) : profile.avatarType === 'custom' && profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[18px] font-semibold text-[#4F9CF9]">
                        {profile.name.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="
                      absolute -bottom-1 -right-1 p-1.5 rounded-lg
                      bg-white dark:bg-[#1A1A18]
                      border border-[#E8E8E4] dark:border-[#252522]
                      text-[#8B8B85] dark:text-[#6B6B63]
                      hover:text-[#4F9CF9] hover:border-[#4F9CF9]/30
                      shadow-sm transition-colors duration-150
                    "
                  >
                    {uploading ? (
                      <Loader2 size={13} strokeWidth={1.8} className="animate-spin" />
                    ) : (
                      <Camera size={13} strokeWidth={1.8} />
                    )}
                  </button>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">
                      Imagen de Perfil
                    </p>
                    <p className="text-[11px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5">
                      Haz clic en la cámara para subir tu foto
                    </p>
                  </div>
                  
                  {/* Selector for Avatar Type */}
                  {profile.googleAvatar && (
                    <div className="flex items-center gap-4 bg-[#F7F7F5] dark:bg-[#1A1A18] p-2 rounded-lg border border-[#E8E8E4] dark:border-[#2A2A26] w-max">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="avatarType"
                          value="custom"
                          checked={profile.avatarType === "custom"}
                          onChange={() => setProfile({...profile, avatarType: "custom"})}
                          className="w-3.5 h-3.5 text-[#4F9CF9] bg-white border-gray-300 focus:ring-[#4F9CF9]"
                        />
                        <span className="text-[12px] font-medium text-[#5C5C56] dark:text-[#8B8B85]">Foto Personalizada</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="avatarType"
                          value="google"
                          checked={profile.avatarType === "google"}
                          onChange={() => setProfile({...profile, avatarType: "google"})}
                          className="w-3.5 h-3.5 text-[#4F9CF9] bg-white border-gray-300 focus:ring-[#4F9CF9]"
                        />
                        <span className="text-[12px] font-medium text-[#5C5C56] dark:text-[#8B8B85] flex items-center gap-1.5"><Chrome size={12} className="text-[#4F9CF9]"/> Foto de Google</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Nombre completo</label>
                    <div className="relative">
                      <User
                        size={13} strokeWidth={1.8}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] pointer-events-none"
                      />
                      <input
                        className={`${inputCls} pl-8`}
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Email</label>
                    <div className="relative">
                      <Mail
                        size={13} strokeWidth={1.8}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] pointer-events-none"
                      />
                      <input
                        className={`${inputCls} pl-8 opacity-50 cursor-not-allowed`}
                        value={profile.email}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>Biografía / Rol</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Describe tu rol o lo que construyes..."
                    className="
                      w-full px-3 py-2.5 rounded-lg text-[12px] resize-none
                      bg-[#F7F7F5] dark:bg-[#1A1A18]
                      border border-[#E8E8E4] dark:border-[#2A2A26]
                      text-[#1A1A18] dark:text-[#F0EFE9]
                      placeholder:text-[#B0B0A8] dark:placeholder:text-[#4A4A44]
                      focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]/30 focus:border-[#4F9CF9]
                      transition-all duration-150
                    "
                  />
                </div>

                {/* --- Languague Preference --- */}
                <div className="space-y-2">
                  <label className={labelCls}>Preferencia de Idioma</label>
                  <div className="flex items-center gap-2 p-1 bg-[#F7F7F5] dark:bg-[#1A1A18] rounded-xl border border-[#E8E8E4] dark:border-[#2A2A26] w-fit">
                    {[
                      { id: 'es', label: 'Español', flag: '🇪🇸' },
                      { id: 'en', label: 'English', flag: '🇺🇸' }
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setProfile({ ...profile, language: lang.id })}
                        type="button"
                        className={`
                          flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200
                          ${profile.language === lang.id
                            ? "bg-white dark:bg-[#252522] text-[#4F9CF9] shadow-sm border border-[#E8E8E4] dark:border-[#353530]"
                            : "text-[#8B8B85] dark:text-[#6B6B63] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]"
                          }
                        `}
                      >
                        <span className="text-[14px]">{lang.flag}</span>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      h-9 px-4 rounded-lg flex items-center gap-2
                      bg-[#4F9CF9] hover:bg-[#3D8EE8]
                      text-white text-[12px] font-medium
                      transition-colors duration-150 shadow-sm
                      disabled:opacity-60
                    "
                  >
                    {saving
                      ? <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                      : <Save size={13} strokeWidth={2} />
                    }
                    Guardar perfil
                  </button>
                </div>
              </form>
            </div>

            {/* ════════════════════════ SECURITY ════════════════════════ */}
            <div className={sectionCls}>

              {/* section header */}
              <div className="flex items-center gap-2 pb-1 border-b border-[#F0F0EC] dark:border-[#1E1E1C]">
                <Fingerprint size={12} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                <span className={labelCls}>Seguridad</span>
              </div>

              {/* Account status pill */}
              <div className="
                flex items-center gap-3 p-3 rounded-lg
                bg-[#F7F7F5] dark:bg-[#1A1A18]
                border border-[#E8E8E4] dark:border-[#2A2A26]
              ">
                <div className="
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  bg-[#F0F0EC] dark:bg-[#1E1E1C]
                  border border-[#E8E8E4] dark:border-[#252522]
                ">
                  {(session as any)?.provider === "google"
                    ? <Chrome size={14} strokeWidth={1.8} className="text-[#4F9CF9]" />
                    : <Mail    size={14} strokeWidth={1.8} className="text-[#4F9CF9]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9] flex items-center gap-1.5">
                    {(session as any)?.provider === "google"
                      ? "Vinculado con Google"
                      : "Acceso por email"
                    }
                    <CheckCircle2 size={11} strokeWidth={2} className="text-emerald-500 dark:text-emerald-400" />
                  </p>
                  <p className="text-[11px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5 truncate">
                    {(session as any)?.provider === "google"
                      ? "Gestionado externamente por Google"
                      : "Protegido por contraseña local"
                    }
                  </p>
                </div>
              </div>

              {/* Password form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <span className={labelCls}>Cambio de contraseña</span>

                <div className="space-y-1.5">
                  <label className={labelCls}>Contraseña actual</label>
                  <div className="relative">
                    <Lock
                      size={13} strokeWidth={1.8}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] pointer-events-none"
                    />
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      className={`${inputCls} pl-8 pr-9`}
                      value={security.currentPassword}
                      onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] hover:text-[#5C5C56] dark:hover:text-[#8B8B85] transition-colors duration-150"
                    >
                      {showCurrentPwd ? <EyeOff size={13} strokeWidth={1.8} /> : <Eye size={13} strokeWidth={1.8} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Nueva contraseña</label>
                    <div className="relative">
                      <Key
                        size={13} strokeWidth={1.8}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] pointer-events-none"
                      />
                      <input
                        type={showNewPwd ? "text" : "password"}
                        className={`${inputCls} pl-8 pr-9`}
                        value={security.newPassword}
                        onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                        placeholder="8+ caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] hover:text-[#5C5C56] dark:hover:text-[#8B8B85] transition-colors duration-150"
                      >
                        {showNewPwd ? <EyeOff size={13} strokeWidth={1.8} /> : <Eye size={13} strokeWidth={1.8} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Confirmar contraseña</label>
                    <div className="relative">
                      <Key
                        size={13} strokeWidth={1.8}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] pointer-events-none"
                      />
                      <input
                        type={showNewPwd ? "text" : "password"}
                        className={`${inputCls} pl-8`}
                        value={security.confirmPassword}
                        onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })}
                        placeholder="Repite la contraseña"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={savingPwd}
                    className="
                      h-9 px-4 rounded-lg flex items-center gap-2
                      bg-[#F7F7F5] dark:bg-[#1A1A18]
                      border border-[#E8E8E4] dark:border-[#2A2A26]
                      text-[#5C5C56] dark:text-[#8B8B85]
                      hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]
                      hover:border-[#D0D0CC] dark:hover:border-[#3A3A36]
                      text-[12px] font-medium
                      transition-colors duration-150
                      disabled:opacity-60
                    "
                  >
                    {savingPwd
                      ? <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                      : <Shield  size={13} strokeWidth={1.8} />
                    }
                    Actualizar contraseña
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}