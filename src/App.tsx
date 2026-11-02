/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Board, Submission, LedgerEntry } from './types/schema';
import { apiClient } from './services/apiClient';
import { audioEngine } from './services/audioEngine';
import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { DiscoveryFeedView } from './components/DiscoveryFeedView';
import { BoardManagementView } from './components/BoardManagementView';
import { SubmissionUploadView } from './components/SubmissionUploadView';
import { UserProfileView } from './components/UserProfileView';
import { LedgerAuditView } from './components/LedgerAuditView';
import { DualLayerAudioPlayer } from './components/DualLayerAudioPlayer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { B2BLandingPage } from './components/B2BLandingPage';
import { StripeResendCentre } from './components/StripeResendCentre';

export default function App() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [profileViewUserId, setProfileViewUserId] = useState<string | null>(null);

  // App domain data
  const [boards, setBoards] = useState<Board[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  // Selected board for board management view navigation
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // Audio Playback
  const [currentTrack, setCurrentTrack] = useState<Submission | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCheckoutTrack, setPendingCheckoutTrack] = useState<Submission | null>(null);

  // Initial data bootstrap
  const refreshCoreData = async () => {
    try {
      const usersList = await apiClient.getUsers();
      setAllUsers(usersList);

      // Check if user previously logged in
      const savedUserId = localStorage.getItem('scofen_user_id');
      if (savedUserId) {
        const found = usersList.find((u) => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
        }
      }

      const boardsList = await apiClient.getBoards();
      setBoards(boardsList);

      const ledger = await apiClient.getLedger();
      setLedgerEntries(ledger);

      const feed = await apiClient.getFeed({ sort: 'score' });
      if (feed.length > 0 && !currentTrack) {
        setCurrentTrack(feed[0]);
      }
    } catch (err) {
      console.error('Bootstrap error', err);
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    refreshCoreData();
  }, []);

  // Refresh user submissions when currentUser changes
  const refreshUserSubmissions = async (userId: string) => {
    try {
      const profile = await apiClient.getUserProfile(userId);
      setMySubmissions(profile.submittedTracks);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshUserSubmissions(currentUser.id);
    }
  }, [currentUser?.id]);

  // Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setProfileViewUserId(user.id);
    localStorage.setItem('scofen_user_id', user.id);
    refreshUserSubmissions(user.id);
  };

  const handleLogout = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentUser(null);
    localStorage.removeItem('scofen_user_id');
  };

  const handleSwitchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      handleLoginSuccess(found);
    }
  };

  const handleSignup = async (firstName: string, lastName: string, email: string, bio: string) => {
    const user = await apiClient.signup(firstName, lastName, email, bio);
    setAllUsers((prev) => [...prev, user]);
    handleLoginSuccess(user);
    return user;
  };

  const handleLogin = async (email: string) => {
    const user = await apiClient.login(email);
    handleLoginSuccess(user);
    return user;
  };

  const handleToggleSubscription = async () => {
    if (!currentUser) return;
    const { user } = await apiClient.toggleSubscriber(currentUser.id);
    setCurrentUser(user);
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  };

  const handleToggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(0.6);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handlePlayTrack = (track: Submission) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleOpenBoard = (boardId: string) => {
    setSelectedBoardId(boardId);
    setActiveTab('boards');
  };

  const handleOpenUserProfile = (userId: string) => {
    setProfileViewUserId(userId);
    setActiveTab('profile');
  };

  if (!isInitialized) {
    return (
      <div style={{ backgroundColor: '#000000', color: '#8c8c8c' }} className="min-h-screen flex items-center justify-center text-xs font-mono">
        Loading SCOFEN...
      </div>
    );
  }

  // REQUIREMENT 2: PEOPLE NEED TO LOG IN TO USE THE SITE, WHEN NOT LOGGED THERE IS A LANDING PAGE
  if (!currentUser) {
    return (
      <>
        <B2BLandingPage
          onLoginSuccess={handleLoginSuccess}
          onOpenLoginModal={() => setIsAuthModalOpen(true)}
        />

        {/* Auth Modal for Log In / Sign Up from Landing Page */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSignup={handleSignup}
          onLogin={handleLogin}
          allUsers={allUsers}
          onSelectUser={(userId) => {
            const found = allUsers.find((u) => u.id === userId);
            if (found) handleLoginSuccess(found);
          }}
        />
      </>
    );
  }

  // AUTHENTICATED WEB APP
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950 pb-28">
      {/* Header Navigation with Jade Green Musical Note Icon & Log Out Option */}
      <HeaderNav
        currentUser={currentUser}
        allUsers={allUsers}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'profile') {
            setProfileViewUserId(currentUser.id);
          }
          setActiveTab(tab);
        }}
        onSwitchUser={handleSwitchUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleSubscription={handleToggleSubscription}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'feed' && (
          <DiscoveryFeedView
            currentUser={currentUser}
            onPlayTrack={handlePlayTrack}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            onToggleSubscription={handleToggleSubscription}
            onOpenUserProfile={handleOpenUserProfile}
          />
        )}

        {activeTab === 'boards' && (
          <BoardManagementView
            boards={boards}
            currentUser={currentUser}
            onRefreshBoards={async () => {
              const updated = await apiClient.getBoards();
              setBoards(updated);
            }}
            onPlayTrack={handlePlayTrack}
            selectedBoardId={selectedBoardId}
          />
        )}

        {activeTab === 'submit' && (
          <SubmissionUploadView
            boards={boards}
            currentUser={currentUser}
            onTrackCreated={async () => {
              refreshUserSubmissions(currentUser.id);
              const bList = await apiClient.getBoards();
              setBoards(bList);
            }}
            onPlayTrack={handlePlayTrack}
            onCheckoutPending={(sub) => setPendingCheckoutTrack(sub)}
            mySubmissions={mySubmissions}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            viewUserId={profileViewUserId || currentUser.id}
            currentUserId={currentUser.id}
            onPlayTrack={handlePlayTrack}
            onOpenBoard={handleOpenBoard}
            onCheckoutPendingTrack={(sub) => setPendingCheckoutTrack(sub)}
            onToggleSubscription={handleToggleSubscription}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerAuditView 
            entries={ledgerEntries} 
            onOpenIntegrations={() => setActiveTab('integrations')}
          />
        )}

        {activeTab === 'integrations' && (
          <StripeResendCentre
            currentUser={currentUser}
            onRefreshLedger={async () => {
              const ledger = await apiClient.getLedger();
              setLedgerEntries(ledger);
            }}
          />
        )}
      </main>

      {/* Dual-Layer Audio Player enforcing 60s gatekeeping & full unlock */}
      <DualLayerAudioPlayer
        currentTrack={currentTrack}
        currentUser={currentUser}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onToggleSubscription={handleToggleSubscription}
      />

      {/* 70/30 Financial Checkout Modal */}
      <CheckoutModal
        submission={pendingCheckoutTrack}
        currentUser={currentUser}
        onClose={() => setPendingCheckoutTrack(null)}
        onPaymentSuccess={async () => {
          refreshUserSubmissions(currentUser.id);
          const ledger = await apiClient.getLedger();
          setLedgerEntries(ledger);
          const bList = await apiClient.getBoards();
          setBoards(bList);
        }}
      />

      {/* Auth Modal for Signup & Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignup={handleSignup}
        onLogin={handleLogin}
        allUsers={allUsers}
        onSelectUser={(userId) => {
          const found = allUsers.find((u) => u.id === userId);
          if (found) handleLoginSuccess(found);
        }}
      />
    </div>
  );
}
