import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../home/home_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _showOtpField = false;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildEditorialHeader(textTheme),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('A thoughtful way to begin', style: textTheme.labelLarge?.copyWith(color: AppColors.gold)),
                    const SizedBox(height: 8),
                    Text('Welcome back.', style: textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Text(
                      'Your next conversation can start with a little intention.',
                      style: textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary, height: 1.5),
                    ),
                    const SizedBox(height: 24),
                    _buildLoginPanel(textTheme),
                    const SizedBox(height: 24),
                    Center(
                      child: Wrap(
                        alignment: WrapAlignment.center,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text("New to Advaita?", style: textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                          TextButton(
                            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                            child: const Text('Create a free profile'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: Text(
                        'By continuing, you agree to meet with respect and care.',
                        textAlign: TextAlign.center,
                        style: textTheme.bodySmall?.copyWith(color: AppColors.textHint, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEditorialHeader(TextTheme textTheme) {
    return SizedBox(
      height: 230,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(
            'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1000&h=700&fit=crop&auto=format&q=82',
            fit: BoxFit.cover,
            semanticLabel: 'Indian couple sharing a joyful moment',
            errorBuilder: (_, __, ___) => Container(color: AppColors.primaryDark),
          ),
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primaryDark.withOpacity(.96), AppColors.primary.withOpacity(.48)],
                begin: Alignment.bottomLeft,
                end: Alignment.topRight,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 26),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(color: AppColors.goldLight, borderRadius: BorderRadius.circular(12)),
                      alignment: Alignment.center,
                      child: Text('A', style: textTheme.headlineSmall?.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.w700)),
                    ),
                    const SizedBox(width: 12),
                    Text('ADVAITA', style: textTheme.labelLarge?.copyWith(color: AppColors.goldLight, letterSpacing: 2.4, fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 18),
                Text('Where every heart finds its match.', style: textTheme.headlineMedium?.copyWith(color: Colors.white, fontWeight: FontWeight.w500, height: 1.02)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoginPanel(TextTheme textTheme) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.divider),
        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(.06), blurRadius: 30, offset: const Offset(0, 14))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 34, height: 34, decoration: BoxDecoration(color: AppColors.goldLight.withOpacity(.35), shape: BoxShape.circle), child: const Icon(Icons.lock_outline, size: 17, color: AppColors.primary)),
              const SizedBox(width: 10),
              Text('Sign in with mobile OTP', style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 8),
          Text('We will send a one-time code to keep your account secure.', style: textTheme.bodySmall?.copyWith(color: AppColors.textSecondary, height: 1.45)),
          const SizedBox(height: 22),
          TextFormField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            maxLength: 10,
            enabled: !_showOtpField,
            decoration: InputDecoration(
              labelText: 'Mobile number',
              prefixIcon: const Icon(Icons.phone_android_outlined),
              prefixText: '+91  ',
              counterText: '',
              suffixIcon: _showOtpField
                  ? TextButton(onPressed: () => setState(() { _showOtpField = false; _otpController.clear(); }), child: const Text('Change'))
                  : null,
            ),
          ),
          if (_showOtpField) ...[
            const SizedBox(height: 22),
            Text('Enter your 6-digit code', style: textTheme.labelLarge),
            const SizedBox(height: 10),
            PinCodeTextField(
              appContext: context,
              length: 6,
              controller: _otpController,
              keyboardType: TextInputType.number,
              animationType: AnimationType.fade,
              pinTheme: PinTheme(
                shape: PinCodeFieldShape.box,
                borderRadius: BorderRadius.circular(12),
                fieldHeight: 48,
                fieldWidth: 42,
                activeFillColor: AppColors.goldLight.withOpacity(.2),
                inactiveFillColor: AppColors.background,
                selectedFillColor: AppColors.goldLight.withOpacity(.3),
                activeColor: AppColors.primary,
                inactiveColor: AppColors.divider,
                selectedColor: AppColors.gold,
              ),
              enableActiveFill: true,
              onCompleted: (_) => _verifyOtp(),
              onChanged: (_) {},
            ),
            Align(alignment: Alignment.centerRight, child: TextButton(onPressed: _sendOtp, child: const Text('Resend code'))),
          ],
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: _isLoading ? null : (_showOtpField ? _verifyOtp : _sendOtp),
              child: _isLoading
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.background))
                  : Text(_showOtpField ? 'Verify and continue' : 'Send secure code'),
            ),
          ),
          Consumer<AuthProvider>(
            builder: (context, auth, _) {
              if (auth.errorMessage == null) return const SizedBox.shrink();
              return Padding(padding: const EdgeInsets.only(top: 12), child: Text(auth.errorMessage!, style: textTheme.bodySmall?.copyWith(color: AppColors.rose)));
            },
          ),
        ],
      ),
    );
  }

  void _sendOtp() async {
    if (_phoneController.text.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter a valid 10-digit mobile number')));
      return;
    }
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.sendOtp(_phoneController.text);
    if (!mounted) return;
    setState(() { _isLoading = false; if (success) _showOtpField = true; });
  }

  void _verifyOtp() async {
    if (_otpController.text.length != 6) return;
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final result = await auth.verifyOtp(_phoneController.text, _otpController.text);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (result['success'] == true) {
      if (result['is_new_user'] == true) {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const RegisterScreen()));
      } else {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
      }
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }
}
