import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/journey_line.dart';
import '../auth/login_screen.dart';
import '../home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  final bool designPreview;

  const SplashScreen({super.key, this.designPreview = false});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late final AnimationController _ambientController;
  late final AnimationController _logoController;
  late final AnimationController _textController;

  @override
  void initState() {
    super.initState();
    _ambientController = AnimationController(vsync: this, duration: const Duration(milliseconds: 2600));
    _logoController = AnimationController(vsync: this, duration: const Duration(milliseconds: 560));
    _textController = AnimationController(vsync: this, duration: const Duration(milliseconds: 520));
    _startAnimations();
  }

  Future<void> _startAnimations() async {
    _ambientController.forward();
    await Future.delayed(const Duration(milliseconds: 1450));
    if (!mounted) return;
    _logoController.forward();
    await Future.delayed(const Duration(milliseconds: 350));
    if (!mounted) return;
    _textController.forward();
    await Future.delayed(const Duration(milliseconds: 800));
    if (mounted) _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    Widget nextScreen;

    if (widget.designPreview) {
      // Explicitly opt-in design preview mode; normal launches still check auth.
      nextScreen = const HomeScreen();
    } else {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.checkAuthStatus();
      if (!mounted) return;
      nextScreen = authProvider.isLoggedIn ? const HomeScreen() : const LoginScreen();
    }

    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => nextScreen,
        transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
        transitionDuration: AppMotion.cinematic,
      ),
    );
  }

  @override
  void dispose() {
    _ambientController.dispose();
    _logoController.dispose();
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    final logoProgress = reduceMotion ? 1.0 : Curves.easeOutCubic.transform(_logoController.value);
    final textProgress = reduceMotion ? 1.0 : Curves.easeOutCubic.transform(_textController.value);

    return Scaffold(
      body: AnimatedBuilder(
        animation: _ambientController,
        builder: (_, __) => Container(
          width: double.infinity,
          height: double.infinity,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primaryDark, AppColors.primary, Color(0xFF3D1937)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            backgroundBlendMode: BlendMode.srcOver,
          ),
          child: Stack(
            children: [
              Positioned.fill(child: CustomPaint(painter: _SplashAtmosphere(progress: reduceMotion ? 1 : _ambientController.value))),
              SafeArea(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(height: MediaQuery.sizeOf(context).height * .08),
                        Opacity(
                          opacity: logoProgress,
                          child: Transform.translate(
                            offset: Offset(0, (1 - logoProgress) * 14),
                            child: _AdvaitaMark(),
                          ),
                        ),
                        const SizedBox(height: 28),
                        const JourneyLine(height: 96, animate: true),
                        const SizedBox(height: 14),
                        Opacity(
                          opacity: textProgress,
                          child: Transform.translate(
                            offset: Offset(0, (1 - textProgress) * 12),
                            child: Column(
                              children: [
                                Text('ADVAITA', style: Theme.of(context).textTheme.displaySmall?.copyWith(color: AppColors.background, letterSpacing: 5, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 10),
                                Text('Two journeys. One beginning.', textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.goldLight, letterSpacing: .3)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 46),
                        Opacity(
                          opacity: textProgress,
                          child: Text('Inclusive matrimony, with dignity.', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Colors.white54, letterSpacing: 1.1)),
                        ),
                        SizedBox(height: MediaQuery.sizeOf(context).height * .08),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AdvaitaMark extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 88,
      height: 88,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.goldLight.withOpacity(.12),
        border: Border.all(color: AppColors.goldLight.withOpacity(.75), width: 1.2),
        boxShadow: [BoxShadow(color: AppColors.gold.withOpacity(.18), blurRadius: 28)],
      ),
      alignment: Alignment.center,
      child: const Text('A', style: TextStyle(fontFamily: 'Cormorant Garamond', fontSize: 52, color: AppColors.goldLight, fontWeight: FontWeight.w600, fontStyle: FontStyle.italic)),
    );
  }
}

class _SplashAtmosphere extends CustomPainter {
  final double progress;
  const _SplashAtmosphere({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final glow = Paint()..shader = RadialGradient(colors: [AppColors.gold.withOpacity(.18), Colors.transparent]).createShader(Rect.fromCircle(center: Offset(size.width * (.25 + progress * .25), size.height * .2), radius: size.width * .65));
    canvas.drawCircle(Offset(size.width * (.25 + progress * .25), size.height * .2), size.width * .65, glow);
    final lower = Paint()..shader = RadialGradient(colors: [AppColors.rose.withOpacity(.12), Colors.transparent]).createShader(Rect.fromCircle(center: Offset(size.width * .8, size.height * .9), radius: size.width * .55));
    canvas.drawCircle(Offset(size.width * .8, size.height * .9), size.width * .55, lower);
  }

  @override
  bool shouldRepaint(covariant _SplashAtmosphere oldDelegate) => oldDelegate.progress != progress;
}
