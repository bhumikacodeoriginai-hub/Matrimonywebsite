import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/match_provider.dart';
import '../../providers/chat_provider.dart';
import '../../theme/app_theme.dart';
import '../search/search_screen.dart';
import '../matches/matches_screen.dart';
import '../chat/chat_list_screen.dart';
import '../profile/my_profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const _HomeTab(),
    const SearchScreen(),
    const MatchesScreen(),
    const ChatListScreen(),
    const MyProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    // Load initial data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<MatchProvider>(context, listen: false).loadRecommendations();
      Provider.of<ChatProvider>(context, listen: false).loadUnreadCount();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(12, 0, 12, 10),
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.divider),
          boxShadow: [
            BoxShadow(color: AppColors.primary.withOpacity(0.12), blurRadius: 30, offset: const Offset(0, 10)),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: [
            const BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
            const BottomNavigationBarItem(icon: Icon(Icons.search_rounded), label: 'Search'),
            const BottomNavigationBarItem(icon: Icon(Icons.favorite_rounded), label: 'Matches'),
            BottomNavigationBarItem(
              icon: Consumer<ChatProvider>(
                builder: (_, chat, child) => Badge(
                  isLabelVisible: chat.unreadCount > 0,
                  label: Text('${chat.unreadCount}'),
                  child: child!,
                ),
                child: const Icon(Icons.chat_bubble_rounded),
              ),
              label: 'Chat',
            ),
            const BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
          ],
        ),
      ),
    );
  }
}

// ============ HOME TAB ============
class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            surfaceTintColor: Colors.transparent,
            backgroundColor: AppColors.background.withOpacity(0.96),
            title: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(child: Text('A', style: TextStyle(color: AppColors.goldLight, fontWeight: FontWeight.bold, fontSize: 20, fontStyle: FontStyle.italic))),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Advaita', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 21)),
                    const Text('M A T R I M O N Y', style: TextStyle(fontSize: 8, color: AppColors.textSecondary, letterSpacing: 1.4, fontWeight: FontWeight.w700)),
                  ],
                ),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () {},
              ),
            ],
          ),

          // Welcome Banner
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(16, 16, 16, 20),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: AppColors.gold.withOpacity(0.28)),
                boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.22), blurRadius: 30, offset: const Offset(0, 16))],
              ),
              child: Consumer<AuthProvider>(
                builder: (_, auth, __) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hi ${auth.userData?['name']?.split(' ').first ?? 'User'}! 👋',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: AppColors.background, fontSize: 28),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Your next chapter could begin today',
                      style: TextStyle(color: AppColors.goldLight, fontSize: 13, letterSpacing: 0.2),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _StatChip(label: 'Profile', value: '${auth.userData?['profile_completion'] ?? 0}%', icon: Icons.person),
                        const SizedBox(width: 12),
                        _StatChip(label: 'Status', value: auth.userData?['profile_status'] == 'approved' ? 'Active' : 'Pending', icon: Icons.verified),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Category Quick Filters
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Browse by Community', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _CategoryCard(icon: '❤️', label: 'General', color: AppColors.categoryGeneral),
                      const SizedBox(width: 8),
                      _CategoryCard(icon: '♿', label: 'Divyangjan', color: AppColors.categoryPhysical),
                      const SizedBox(width: 8),
                      _CategoryCard(icon: '🤟', label: 'Deaf/Mute', color: AppColors.categoryHearing),
                      const SizedBox(width: 8),
                      _CategoryCard(icon: '⭐', label: 'Vitiligo', color: AppColors.categoryVitiligo),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Recommended Matches
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Curated for You', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 23)),
                  TextButton(onPressed: () {}, child: const Text('View All')),
                ],
              ),
            ),
          ),

          // Profile Cards
          Consumer<MatchProvider>(
            builder: (_, matchProvider, __) {
              if (matchProvider.isLoading) {
                return const SliverToBoxAdapter(
                  child: Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator())),
                );
              }

              if (matchProvider.recommendations.isEmpty) {
                return const SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: Column(
                        children: [
                          Icon(Icons.people_outline, size: 60, color: Colors.grey),
                          SizedBox(height: 16),
                          Text('Complete your profile to get recommendations', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                );
              }

              return SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final match = matchProvider.recommendations[index];
                    return _ProfileCard(profile: match);
                  },
                  childCount: matchProvider.recommendations.length,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatChip({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 6),
          Text('$label: $value', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final String icon;
  final String label;
  final Color color;

  const _CategoryCard({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final Map<String, dynamic> profile;

  const _ProfileCard({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.divider),
        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.08), blurRadius: 24, offset: const Offset(0, 10))],
      ),
      child: Row(
        children: [
          // Photo
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              color: AppColors.goldLight.withOpacity(0.25),
            ),
            child: profile['photo'] != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Image.network(profile['photo'], fit: BoxFit.cover),
                  )
                : Icon(Icons.person, size: 36, color: AppColors.primary.withOpacity(0.5)),
          ),
          const SizedBox(width: 14),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      profile['name'] ?? 'User',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    if (profile['is_premium'] == true) ...[
                      const SizedBox(width: 6),
                      const Icon(Icons.verified, color: AppColors.gold, size: 16),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${profile['age'] ?? ''} yrs • ${profile['city'] ?? ''}, ${profile['state'] ?? ''}',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 4),
                Text(
                  '${profile['highest_education'] ?? ''} • ${profile['occupation'] ?? ''}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    profile['category_display'] ?? 'General',
                    style: const TextStyle(fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
          ),

          // Actions
          Column(
            children: [
              IconButton(
                icon: const Icon(Icons.favorite_border, color: AppColors.rose),
                onPressed: () {
                  Provider.of<MatchProvider>(context, listen: false).sendInterest(profile['id']);
                },
              ),
              IconButton(
                icon: const Icon(Icons.bookmark_border, color: AppColors.primary),
                onPressed: () {
                  Provider.of<MatchProvider>(context, listen: false).addToShortlist(profile['id']);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
