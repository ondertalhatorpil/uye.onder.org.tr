import React from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
  FiCalendar, FiUsers, FiHome, FiBook
} from 'react-icons/fi';

// Info Card Component
const InfoCard = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <h3 className="text-lg font-bold text-gray-900 flex items-center">
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
            <Icon className="h-4 w-4 text-red-600" />
          </div>
        )}
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// Info Item Component
const InfoItem = ({ icon: Icon, label, value, href, color = "gray" }) => {
  const content = (
    <div className={`flex items-center p-4 rounded-xl hover:bg-${color}-50 transition-all duration-200 group`}>
      <div className={`h-10 w-10 rounded-lg bg-${color}-100 group-hover:bg-${color}-200 flex items-center justify-center mr-4 transition-colors`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-gray-900 font-medium">{value || 'Belirtilmemiş'}</div>
      </div>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
};

const InfoSection = ({ user, formatDateForDisplay }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Personal Info */}
      <InfoCard title="Kişisel Bilgiler" icon={FiUser}>
        <div className="space-y-2">
          <InfoItem 
            icon={FiMail} 
            label="Email" 
            value={user.email}
            href={`mailto:${user.email}`}
            color="blue"
          />
          <InfoItem 
            icon={FiPhone} 
            label="Telefon" 
            value={user.telefon}
            href={user.telefon ? `tel:${user.telefon}` : null}
            color="green"
          />
          <InfoItem 
            icon={FiCalendar} 
            label="Doğum Tarihi" 
            value={formatDateForDisplay(user.dogum_tarihi)}
            color="purple"
          />
          <InfoItem 
            icon={FiMapPin} 
            label="Lokasyon" 
            value={`${user.il}${user.ilce ? `, ${user.ilce}` : ''}`}
            color="red"
          />
        </div>
      </InfoCard>

      {/* Professional Info */}
      <InfoCard title="Mesleki Bilgiler" icon={FiBriefcase}>
        <div className="space-y-2">
          <InfoItem 
            icon={FiBriefcase} 
            label="Sektör" 
            value={user.sektor}
            color="indigo"
          />
          <InfoItem 
            icon={FiBriefcase} 
            label="Meslek" 
            value={user.meslek}
            color="cyan"
          />
        </div>
      </InfoCard>

      {/* Association Info */}
      <InfoCard title="Dernek Bilgileri" icon={FiHome}>
        <InfoItem 
          icon={FiHome} 
          label="Gönüllü Olunan Dernek" 
          value={user.gonullu_dernek}
          color="red"
        />
         <InfoItem 
            icon={FiUsers} 
            label="Çalışma Komisyonu" 
            value={user.calisma_komisyon}
            color="orange"
          />
           <InfoItem 
            icon={FiBook} 
            label="Mezun Olunan Okul" 
            value={user.mezun_okul}
            color="green"
          />
      </InfoCard>
    </div>
  );
};

export default InfoSection;