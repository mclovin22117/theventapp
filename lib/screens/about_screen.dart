import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(
            Icons.arrow_back_ios,
            color: Colors.white,
          ),
        ),
        title: const Text(
          'About',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),

            // App Logo
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF7C4DFF).withOpacity(0.4),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Image.asset(
                  'assets/images/logo.png',
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // App Name
            const Text(
              'TheVent',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 6),

            // Version
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 4,
              ),
              decoration: BoxDecoration(
                color: const Color(0xFF7C4DFF).withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: const Color(0xFF7C4DFF).withOpacity(0.4),
                ),
              ),
              child: const Text(
                'Version 1.0.0',
                style: TextStyle(
                  color: Color(0xFF7C4DFF),
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 30),

            // Description Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: const Color(0xFF2C2C2C),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: Color(0xFF7C4DFF),
                        size: 20,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'About TheVent',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'TheVent is a safe and anonymous space where you can freely express your thoughts, feelings, and frustrations without judgment.\n\nShare what\'s on your mind, connect with others who understand, and find comfort knowing you\'re not alone.',
                    style: TextStyle(
                      color: Color(0xFF9E9E9E),
                      fontSize: 14,
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Developer Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: const Color(0xFF2C2C2C),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.code,
                        color: Color(0xFF7C4DFF),
                        size: 20,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Developer',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildDeveloperTile(
                    name: 'TheVent Team',
                    role: 'Design & Development',
                    icon: Icons.groups_outlined,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Links Card
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: const Color(0xFF2C2C2C),
                ),
              ),
              child: Column(
                children: [
                  _buildLinkTile(
                    icon: Icons.privacy_tip_outlined,
                    title: 'Privacy Policy',
                    onTap: () => _showComingSoon(context, 'Privacy Policy'),
                    isFirst: true,
                  ),
                  const Divider(
                    color: Color(0xFF2C2C2C),
                    height: 1,
                  ),
                  _buildLinkTile(
                    icon: Icons.description_outlined,
                    title: 'Terms of Service',
                    onTap: () => _showComingSoon(context, 'Terms of Service'),
                  ),
                  const Divider(
                    color: Color(0xFF2C2C2C),
                    height: 1,
                  ),
                  _buildLinkTile(
                    icon: Icons.bug_report_outlined,
                    title: 'Report a Bug',
                    onTap: () => _showComingSoon(context, 'Bug Report'),
                    isLast: true,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),

            // Footer
            const Text(
              'Made with ❤️ by TheVent Team',
              style: TextStyle(
                color: Color(0xFF9E9E9E),
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '© 2026 TheVent. All rights reserved.',
              style: TextStyle(
                color: Color(0xFF555555),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildDeveloperTile({
    required String name,
    required String role,
    required IconData icon,
  }) {
    return Row(
      children: [
        CircleAvatar(
          radius: 22,
          backgroundColor: const Color(0xFF2C2C2C),
          child: Icon(
            icon,
            color: const Color(0xFF7C4DFF),
            size: 22,
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              name,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            Text(
              role,
              style: const TextStyle(
                color: Color(0xFF9E9E9E),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLinkTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isFirst = false,
    bool isLast = false,
  }) {
    return ListTile(
      onTap: onTap,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: isFirst ? const Radius.circular(16) : Radius.zero,
          bottom: isLast ? const Radius.circular(16) : Radius.zero,
        ),
      ),
      leading: Icon(
        icon,
        color: const Color(0xFF7C4DFF),
        size: 22,
      ),
      title: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
        ),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios,
        color: Color(0xFF9E9E9E),
        size: 14,
      ),
    );
  }

  void _showComingSoon(BuildContext context, String title) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          title,
          style: const TextStyle(color: Colors.white),
        ),
        content: const Text(
          'This page is coming soon!',
          style: TextStyle(color: Color(0xFF9E9E9E)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'OK',
              style: TextStyle(
                color: Color(0xFF7C4DFF),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}