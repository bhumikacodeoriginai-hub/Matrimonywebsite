import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../localization/app_localizations.dart';
import '../auth/login_screen.dart';

class MyProfileScreen extends StatelessWidget {
  const MyProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.of(context).myProfile),
        actions: [
          TextButton(
            onPressed: () => context.read<AppLanguageProvider>().toggle(),
            child: Text(AppStrings.of(context).languageLabel),
          ),
          IconButton(icon: const Icon(Icons.edit), onPressed: () {}),
          IconButton(icon: const Icon(Icons.settings), onPressed: () {}),
        ],
      ),
      body: Consumer<AuthProvider>(
        builder: (_, auth, __) {
          final strings = AppStrings.of(context);
          final user = auth.userData;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Profile Header Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: AppColors.gold.withOpacity(0.3)),
                    boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.22), blurRadius: 32, offset: const Offset(0, 16))],
                  ),
                  child: Column(
                    children: [
                      // Avatar
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          color: Colors.white.withOpacity(0.2),
                        ),
                        child: const Icon(Icons.person, size: 50, color: Colors.white),
                      ),
                      const SizedBox(height: 16),
                      Text(user?['name'] ?? 'User', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(user?['unique_id'] ?? '', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                      const SizedBox(height: 12),

                      // Premium Badge
                      if (user?['is_premium'] == true)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          decoration: BoxDecoration(
                            gradient: AppColors.goldGradient,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.auto_awesome, color: AppColors.primaryDark, size: 16),
                              const SizedBox(width: 6),
                              Text(strings.premiumMember, style: const TextStyle(color: AppColors.primaryDark, fontSize: 12, fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),

                      const SizedBox(height: 16),

                      // Profile Completion
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('${strings.profileComplete}: ${user?['profile_completion'] ?? 0}% ${strings.complete}',
                                  style: const TextStyle(color: Colors.white, fontSize: 13)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          LinearProgressIndicator(
                            value: (user?['profile_completion'] ?? 0) / 100,
                            backgroundColor: AppColors.background.withOpacity(0.16),
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.goldLight),
                            borderRadius: BorderRadius.circular(10),
                            minHeight: 6,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Menu Items
                _MenuSection(
                  title: strings.myActivity,
                  items: [
                    _MenuItem(icon: Icons.visibility, label: strings.whoViewedMe, count: '12', color: AppColors.primary),
                    _MenuItem(icon: Icons.favorite, label: strings.interestsReceived, count: '5', color: AppColors.rose),
                    _MenuItem(icon: Icons.send, label: strings.interestsSent, count: '8', color: AppColors.gold),
                    _MenuItem(icon: Icons.bookmark, label: strings.shortlisted, count: '15', color: AppColors.primaryLight),
                  ],
                ),

                const SizedBox(height: 16),

                _MenuSection(
                  title: strings.account,
                  items: [
                    _MenuItem(icon: Icons.card_membership, label: strings.subscription, color: AppColors.gold),
                    _MenuItem(icon: Icons.receipt_long, label: strings.paymentHistory, color: AppColors.green),
                    _MenuItem(icon: Icons.privacy_tip, label: strings.privacySettings, color: AppColors.primary),
                    _MenuItem(icon: Icons.notifications, label: strings.notifications, color: AppColors.rose),
                    _MenuItem(icon: Icons.help, label: strings.helpSupport, color: AppColors.primaryLight),
                  ],
                ),

                const SizedBox(height: 16),

                // Logout Button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      await auth.logout();
                      if (context.mounted) {
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                          (_) => false,
                        );
                      }
                    },
                    icon: const Icon(Icons.logout, color: Colors.red),
                    label: Text(strings.logout, style: const TextStyle(color: Colors.red)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),

                const SizedBox(height: 30),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;

  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.divider),
            boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.07), blurRadius: 24, offset: const Offset(0, 10))],
          ),
          child: Column(
            children: items.map((item) => _buildMenuItem(item)).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem(_MenuItem item) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: item.color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(item.icon, color: item.color, size: 20),
      ),
      title: Text(item.label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (item.count != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: item.color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(item.count!, style: TextStyle(fontSize: 12, color: item.color, fontWeight: FontWeight.w600)),
            ),
          const SizedBox(width: 8),
          Icon(Icons.chevron_right, color: AppColors.textHint, size: 20),
        ],
      ),
      onTap: () {},
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String label;
  final String? count;
  final Color color;

  const _MenuItem({required this.icon, required this.label, this.count, required this.color});
}
