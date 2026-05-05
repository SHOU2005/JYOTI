import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Camera, Monitor, Bell, ShieldAlert } from 'lucide-react';

export function ProctorConsentModal({ onAccept, onDecline }) {
  const requestPermissionsAndAccept = async () => {
    try {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
      onAccept();
    } catch (e) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="max-w-xl p-8 bg-zinc-900 border-red-500/30 shadow-2xl shadow-red-500/10">
        <div className="flex items-center gap-4 mb-6">
          <ShieldAlert className="w-10 h-10 text-red-400" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
            Strict Proctoring Active
          </h2>
        </div>
        
        <p className="text-base text-zinc-300 mb-6 leading-relaxed">
          This is a heavily monitored Live AI Interview. To guarantee integrity and prevent cheating modes (like looking at your phone or opening multiple screens), you must grant the following permissions before starting:
        </p>

        <div className="space-y-4 mb-8">
           <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-lg border border-white/5">
              <Camera className="w-5 h-5 text-blue-400" />
              <div className="text-sm"><span className="font-semibold text-white">Camera & Microphone:</span> Monitored for eye-tracking and voice analysis.</div>
           </div>
           <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-lg border border-white/5">
              <Monitor className="w-5 h-5 text-purple-400" />
              <div className="text-sm"><span className="font-semibold text-white">Screen Sharing:</span> Entire screen sharing is enforced to prevent multiple screens.</div>
           </div>
           <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-lg border border-white/5">
              <Bell className="w-5 h-5 text-yellow-400" />
              <div className="text-sm"><span className="font-semibold text-white">Notifications API:</span> Required to alert you if you look away or lose focus.</div>
           </div>
        </div>

        <div className="flex gap-4 justify-end mt-4">
          <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={onDecline}>
            Decline & Exit
          </Button>
          <Button size="lg" className="bg-red-600 hover:bg-red-500 text-white font-semibold px-8" onClick={requestPermissionsAndAccept}>
            I Agree & Proceed
          </Button>
        </div>
      </Card>
    </div>
  );
}
