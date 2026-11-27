'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UsersTab } from '@/components/settings/UsersTab';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { UserTargetTab } from '@/components/settings/UserTargetTab';
import { RbacTab } from '@/components/settings/RbacTab';
import { OpportunityStagesTab } from '@/components/settings/OpportunityStagesTab';
import { OpportunityLostReasonTab } from '@/components/settings/OpportunityLostReasonTab';
import { InitialSettingsTab } from '@/components/settings/InitialSettingsTab';
import { CampaignSettingsTab } from '@/components/settings/CampaignSettingsTab';
import { OrderSettingsTab } from '@/components/settings/OrderSettingsTab';
import { TaskSettingsTab } from '@/components/settings/TaskSettingsTab';
import { OpportunitySettingsTab } from '@/components/settings/OpportunitySettingsTab';
import { CompanyTargetTab } from '@/components/settings/CompanyTargetTab';
import { CostJobTab } from '@/components/settings/CostJobTab';
import { TagsTab } from '@/components/settings/TagsTab';
import { ProductsTab } from '@/components/settings/ProductsTab';
import { SystemSettingsTab } from '@/components/settings/SystemSettingsTab';
import { SecuritySettingsTab } from '@/components/settings/SecuritySettingsTab';
import { BackupSettingsTab } from '@/components/settings/BackupSettingsTab';

function SettingsModuleRouter() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') || 'users';
  const sub = searchParams?.get('sub') || 'source';
  const userId = searchParams?.get('userId') || undefined;

  switch (tab) {
    case 'users':
    case 'team-members':
    case 'team_members':
    case 'team-assignments':
      return <UsersTab selectedUserId={userId} />;
    case 'profile':
    case 'employee-details':
      return <ProfileTab />;
    case 'user-target':
    case 'user-targets':
      return <UserTargetTab />;
    case 'rbac':
    case 'roles':
      return <RbacTab />;
    case 'opportunity-settings':
    case 'opportunity-stages':
    case 'opp-stages':
      return <OpportunityStagesTab />;
    case 'opportunity-lost-reason':
      return <OpportunityLostReasonTab />;
    case 'initial':
    case 'lead-sources':
    case 'customer-groups':
      return <InitialSettingsTab initialSubTab={tab === 'lead-sources' ? 'source' : sub} />;
    case 'campaign':
    case 'campaigns':
      return <CampaignSettingsTab />;
    case 'order':
    case 'orders':
      return <OrderSettingsTab initialSubTab={sub} />;
    case 'task':
    case 'tasks':
    case 'task-settings':
      return <TaskSettingsTab />;
    case 'opportunity':
      return <OpportunitySettingsTab />;
    case 'target':
    case 'targets':
      return <CompanyTargetTab />;
    case 'cost-job':
      return <CostJobTab />;
    case 'tags':
      return <TagsTab />;
    case 'products':
    case 'product-categories':
      return <ProductsTab />;
    case 'system':
    case 'dashboard-preferences':
    case 'notifications':
      return <SystemSettingsTab />;
    case 'security':
      return <SecuritySettingsTab />;
    case 'backup':
      return <BackupSettingsTab />;
    default:
      return <UsersTab selectedUserId={userId} />;
  }
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-medium">Loading settings module...</div>}>
      <SettingsModuleRouter />
    </Suspense>
  );
}
