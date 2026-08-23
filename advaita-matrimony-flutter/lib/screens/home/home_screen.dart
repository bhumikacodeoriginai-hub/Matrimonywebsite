import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../providers/auth_provider.dart';
import '../../providers/match_provider.dart';
import '../../providers/chat_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/advaita_mark.dart';
import '../../widgets/journey_line.dart';
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
class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> with SingleTickerProviderStateMixin {
  static const _compassPreferenceKey = 'advaita-compass-index';
  int _compassIndex = 0;
  late final AnimationController _entranceController;

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(vsync: this, duration: AppMotion.reveal);
    _loadCompassPreference();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
      if (reduceMotion) {
        _entranceController.value = 1;
      } else {
        _entranceController.forward();
      }
    });
  }

  Future<void> _loadCompassPreference() async {
    try {
      final preferences = await SharedPreferences.getInstance();
      final savedIndex = preferences.getInt(_compassPreferenceKey);
      if (!mounted || savedIndex == null || savedIndex < 0 || savedIndex >= _compassItems.length) return;
      setState(() => _compassIndex = savedIndex);
    } catch (_) {
      // The compass remains usable with its in-memory default if storage is unavailable.
    }
  }

  void _selectCompass(int index) {
    setState(() => _compassIndex = index);
    _saveCompassPreference(index);
  }

  Future<void> _saveCompassPreference(int index) async {
    try {
      final preferences = await SharedPreferences.getInstance();
      await preferences.setInt(_compassPreferenceKey, index);
    } catch (_) {
      // Preference persistence is optional; the current selection still works.
    }
  }

  static const _compassItems = [
    {'icon': Icons.favorite_rounded, 'title': 'Shared values', 'subtitle': 'Life, family, and outlook', 'score': '92', 'copy': 'Start with the details that shape everyday life.'},
    {'icon': Icons.accessibility_new_rounded, 'title': 'Accessibility', 'subtitle': 'Be understood, fully', 'score': '88', 'copy': 'Keep accessibility and communication visible from the beginning.'},
    {'icon': Icons.hourglass_bottom_rounded, 'title': 'Your pace', 'subtitle': 'No pressure, ever', 'score': '96', 'copy': 'Choose a thoughtful introduction without pressure or timers.'},
  ];

  @override
  void dispose() {
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final compass = _compassItems[_compassIndex];
    final disableAnimations = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            surfaceTintColor: Colors.transparent,
            backgroundColor: AppColors.background.withOpacity(0.96),
            title: const AdvaitaMark(),
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () {},
              ),
            ],
          ),

          // Welcome Banner
          SliverToBoxAdapter(
            child: _HomeReveal(
              animation: _entranceController,
              start: 0,
              end: .28,
              disableAnimations: disableAnimations,
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
                    Text('Hi ${auth.userData?['name']?.split(' ').first ?? 'there'}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: AppColors.background, fontSize: 30)),
                    const SizedBox(height: 4),
                    const Text('Two journeys. One beginning.', style: TextStyle(color: AppColors.goldLight, fontSize: 13, letterSpacing: .3)),
                    const SizedBox(height: 2),
                    const Text('Your next chapter could begin today.', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    const JourneyLine(height: 48, animate: true),
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
          ),

          // Connection Compass: a calm, explainable discovery signal.
          SliverToBoxAdapter(
            child: _HomeReveal(
              animation: _entranceController,
              start: .16,
              end: .48,
              disableAnimations: disableAnimations,
              child: _ConnectionCompass(
                selectedIndex: _compassIndex,
                items: _compassItems,
                disableAnimations: disableAnimations,
                onSelected: _selectCompass,
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
                  _HomeReveal(
                    animation: _entranceController,
                    start: .38,
                    end: .52,
                    disableAnimations: disableAnimations,
                    child: Text('Explore communities', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 23)),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _HomeReveal(animation: _entranceController, start: .44, end: .60, disableAnimations: disableAnimations, child: _CategoryCard(icon: '❤️', label: 'General', color: AppColors.categoryGeneral))),
                      const SizedBox(width: 8),
                      Expanded(child: _HomeReveal(animation: _entranceController, start: .49, end: .65, disableAnimations: disableAnimations, child: _CategoryCard(icon: '♿', label: 'Divyangjan', color: AppColors.categoryPhysical))),
                      const SizedBox(width: 8),
                      Expanded(child: _HomeReveal(animation: _entranceController, start: .54, end: .70, disableAnimations: disableAnimations, child: _CategoryCard(icon: '🤟', label: 'Deaf/Mute', color: AppColors.categoryHearing))),
                      const SizedBox(width: 8),
                      Expanded(child: _HomeReveal(animation: _entranceController, start: .59, end: .75, disableAnimations: disableAnimations, child: _CategoryCard(icon: '⭐', label: 'Vitiligo', color: AppColors.categoryVitiligo))),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Recommended Matches
          SliverToBoxAdapter(
            child: _HomeReveal(
              animation: _entranceController,
              start: .52,
              end: .78,
              disableAnimations: disableAnimations,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('A considered introduction', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 23)),
                    TextButton(onPressed: () {}, child: const Text('View All')),
                  ],
                ),
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
                    final revealStart = (.68 + (index * .08)).clamp(.68, .86).toDouble();
                    return _HomeReveal(
                      animation: _entranceController,
                      start: revealStart,
                      end: (revealStart + .22).clamp(0.9, 1.0).toDouble(),
                      disableAnimations: disableAnimations,
                      child: _ProfileCard(profile: match),
                    );
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

class _HomeReveal extends StatelessWidget {
  final Animation<double> animation;
  final double start;
  final double end;
  final bool disableAnimations;
  final Widget child;

  const _HomeReveal({
    required this.animation,
    required this.start,
    required this.end,
    required this.disableAnimations,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    if (disableAnimations) return child;

    return AnimatedBuilder(
      animation: animation,
      child: child,
      builder: (_, child) {
        final progress = Interval(start, end, curve: AppMotion.easeOut).transform(animation.value);
        return Opacity(
          opacity: progress,
          child: Transform.translate(
            offset: Offset(0, (1 - progress) * 18),
            child: child,
          ),
        );
      },
    );
  }
}

class _ConnectionCompass extends StatelessWidget {
  final int selectedIndex;
  final List<Map<String, Object>> items;
  final bool disableAnimations;
  final ValueChanged<int> onSelected;

  const _ConnectionCompass({required this.selectedIndex, required this.items, required this.disableAnimations, required this.onSelected});

  Widget _buildOptionCard(BuildContext context, int index) {
    final item = items[index];
    final active = index == selectedIndex;
    return Semantics(
      button: true,
      selected: active,
      label: item['title'] as String,
      child: InkWell(
        onTap: () => onSelected(index),
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: disableAnimations ? Duration.zero : const Duration(milliseconds: 260),
          constraints: const BoxConstraints(minHeight: 102),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: active ? AppColors.goldLight.withOpacity(0.2) : Colors.white.withOpacity(0.07),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: active ? AppColors.goldLight : Colors.white24),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(item['icon'] as IconData, color: AppColors.goldLight, size: 19),
              const SizedBox(height: 16),
              Text(item['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
              const SizedBox(height: 3),
              Text(item['subtitle'] as String, style: const TextStyle(color: Colors.white60, fontSize: 9, height: 1.2)),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selected = items[selectedIndex];
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 4, 16, 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primaryDark, AppColors.primary, AppColors.primaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.goldLight.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.2), blurRadius: 28, offset: const Offset(0, 14))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.explore_rounded, color: AppColors.goldLight, size: 18),
              const SizedBox(width: 8),
              Text('YOUR DISCOVERY SIGNAL', style: TextStyle(color: AppColors.goldLight.withOpacity(0.9), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.4)),
            ],
          ),
          const SizedBox(height: 10),
          Text('Meet with intention.', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: AppColors.background, fontSize: 30)),
          const SizedBox(height: 5),
          const Text('Set the lens for your discovery. Choose what matters most today and keep your next introduction focused on what feels right.', style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.45)),
          const SizedBox(height: 18),
          LayoutBuilder(
            builder: (context, constraints) {
              final cards = List.generate(items.length, (index) => _buildOptionCard(context, index));
              if (constraints.maxWidth < 380) {
                return Column(
                  children: cards.map((card) => Padding(padding: const EdgeInsets.only(bottom: 7), child: card)).toList(),
                );
              }
              return Row(
                children: List.generate(cards.length, (index) => Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(right: index == cards.length - 1 ? 0 : 7),
                    child: cards[index],
                  ),
                )),
              );
            },
          ),
          const SizedBox(height: 14),
          Semantics(
            liveRegion: true,
            label: '${selected['title']} — ${selected['score']} out of 100. ${selected['copy']}',
            child: AnimatedSwitcher(
              duration: disableAnimations ? Duration.zero : const Duration(milliseconds: 260),
              child: Row(
                key: ValueKey(selectedIndex),
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.goldLight)),
                    child: Text(selected['score'] as String, style: const TextStyle(color: AppColors.goldLight, fontSize: 16, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Text(selected['copy'] as String, style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.35))),
                ],
              ),
            ),
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
    return Container(
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
