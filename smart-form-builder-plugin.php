<?php
/*
Plugin Name: Smart Form Builder
Description: Embed your MERN-based Smart Form Builder React app in WordPress via shortcode.
Version: 1.0
Author: Your Name
*/

// [smart_form_builder] shortcode to embed React app
function smart_form_builder_shortcode($atts) {
    $atts = shortcode_atts([
        'url' => 'http://localhost:5173',
        'height' => '800px',
        'width' => '100%',
        'show_admin' => 'false',
        'theme' => 'light'
    ], $atts);
    
    $iframe_url = esc_url($atts['url']);
    $height = esc_attr($atts['height']);
    $width = esc_attr($atts['width']);
    $show_admin = filter_var($atts['show_admin'], FILTER_VALIDATE_BOOLEAN);
    $theme = esc_attr($atts['theme']);
    
    // Determine if user should see admin interface
    $role = ($show_admin && current_user_can('manage_options')) ? 'admin' : 'user';
    $iframe_url_with_params = add_query_arg([
        'role' => $role,
        'theme' => $theme
    ], $iframe_url);
    
    // Generate a unique ID for the iframe
    $iframe_id = 'smart-form-builder-' . uniqid();
    
    // Add Bootstrap Icons CSS
    wp_enqueue_style('bootstrap-icons', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
    
    // Create responsive iframe with loading indicator
    $output = '<div class="smart-form-builder-container" style="position:relative; border-radius:8px; overflow:hidden; box-shadow:0 0.5rem 1rem rgba(0,0,0,0.08);">';
    $output .= '<div id="' . $iframe_id . '-loader" style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center;background-color:#f8f9fa;z-index:1;">';
    $output .= '<div style="text-align:center;">';
    $output .= '<div style="font-size:3rem; color:#0d6efd; margin-bottom:1rem;"><i class="bi bi-file-earmark-text"></i></div>';
    $output .= '<div class="spinner" style="border:3px solid rgba(0,0,0,0.1);border-top:3px solid #0d6efd;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 1rem;"></div>';
    $output .= '<p style="font-family:system-ui,-apple-system,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial; color:#6c757d;">Loading Smart Form Builder...</p>';
    $output .= '</div>';
    $output .= '</div>';
    $output .= '<iframe id="' . $iframe_id . '" src="' . $iframe_url_with_params . '" style="width:' . $width . ';height:' . $height . ';border:none;" onload="document.getElementById(\''. $iframe_id .'-loader\').style.display=\'none\';" allowfullscreen></iframe>';
    $output .= '</div>';
    $output .= '<style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>';
    
    return $output;
}
add_shortcode('smart_form_builder', 'smart_form_builder_shortcode');

// Add admin menu for configuration
add_action('admin_menu', function() {
    add_menu_page(
        'Smart Form Builder', 
        'Smart Form Builder', 
        'manage_options', 
        'smart-form-builder', 
        'smart_form_builder_admin_page',
        'dashicons-feedback',
        30
    );
});

// Admin page content
function smart_form_builder_admin_page() {
    // Enqueue Bootstrap Icons
    wp_enqueue_style('bootstrap-icons', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
    ?>
    <div class="wrap">
        <div style="display:flex; align-items:center; margin-bottom:20px;">
            <div style="font-size:2.5rem; color:#0d6efd; margin-right:15px;">
                <i class="bi bi-file-earmark-text"></i>
            </div>
            <h1>Smart Form Builder Plugin</h1>
        </div>
        
        <div class="notice notice-info is-dismissible" style="padding:12px 15px; margin:20px 0;">
            <p><i class="bi bi-info-circle-fill" style="margin-right:8px;"></i> Create professional forms and collect submissions with our easy-to-use form builder.</p>
        </div>
        
        <div class="card" style="max-width:900px; padding:25px; margin-top:20px; border-radius:8px; box-shadow:0 0.5rem 1rem rgba(0,0,0,0.08);">
            <h2 style="margin-top:0; display:flex; align-items:center;">
                <i class="bi bi-code-slash" style="margin-right:10px; color:#0d6efd;"></i>
                How to Use
            </h2>
            <p>Use the shortcode to embed the Smart Form Builder in any page or post:</p>
            
            <div style="background:#f8f9fa; padding:20px; border-radius:8px; border-left:4px solid #0d6efd; margin:20px 0; font-family:monospace; font-size:14px;">
                [smart_form_builder url="http://localhost:5173" height="800px" width="100%" show_admin="false" theme="light"]
            </div>
            
            <h3 style="margin-top:30px; display:flex; align-items:center;">
                <i class="bi bi-gear" style="margin-right:10px; color:#0d6efd;"></i>
                Shortcode Parameters
            </h3>
            <table class="widefat" style="border-radius:8px; overflow:hidden; margin:15px 0;">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Description</th>
                        <th>Default</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>url</code></td>
                        <td>URL to your deployed React app</td>
                        <td><code>http://localhost:5173</code></td>
                    </tr>
                    <tr>
                        <td><code>height</code></td>
                        <td>Height of the iframe</td>
                        <td><code>800px</code></td>
                    </tr>
                    <tr>
                        <td><code>width</code></td>
                        <td>Width of the iframe</td>
                        <td><code>100%</code></td>
                    </tr>
                    <tr>
                        <td><code>show_admin</code></td>
                        <td>Whether to show admin interface to WordPress admins</td>
                        <td><code>false</code></td>
                    </tr>
                    <tr>
                        <td><code>theme</code></td>
                        <td>Color theme for the form builder (light or dark)</td>
                        <td><code>light</code></td>
                    </tr>
                </tbody>
            </table>
            
            <h3 style="margin-top:30px; display:flex; align-items:center;">
                <i class="bi bi-shield-lock" style="margin-right:10px; color:#0d6efd;"></i>
                Admin Access
            </h3>
            <p>When <code>show_admin="true"</code> is set, WordPress administrators will see the admin interface of the form builder.</p>
            <p>Regular users will only see the public form submission interface.</p>
            
            <div style="background:#e8f4fe; padding:15px; border-radius:8px; margin:20px 0; display:flex; align-items:flex-start;">
                <div style="font-size:1.5rem; color:#0d6efd; margin-right:15px;">
                    <i class="bi bi-lightbulb"></i>
                </div>
                <div>
                    <strong>Pro Tip:</strong> You can create different shortcodes on different pages - one for admins to manage forms and another for users to submit them.
                </div>
            </div>
        </div>
        
        <div class="card" style="max-width:900px; padding:25px; margin-top:20px; border-radius:8px; box-shadow:0 0.5rem 1rem rgba(0,0,0,0.08);">
            <h2 style="margin-top:0; display:flex; align-items:center;">
                <i class="bi bi-server" style="margin-right:10px; color:#0d6efd;"></i>
                Server Configuration
            </h2>
            <p>Make sure your server is properly configured with:</p>
            <ul style="list-style-type:none; padding-left:10px;">
                <li style="margin-bottom:10px; display:flex; align-items:center;">
                    <i class="bi bi-database" style="margin-right:10px; color:#0d6efd;"></i>
                    <strong>MongoDB database connection</strong> - Set up in your server's .env file
                </li>
                <li style="margin-bottom:10px; display:flex; align-items:center;">
                    <i class="bi bi-key" style="margin-right:10px; color:#0d6efd;"></i>
                    <strong>JWT secret key</strong> - For secure authentication
                </li>
                <li style="margin-bottom:10px; display:flex; align-items:center;">
                    <i class="bi bi-globe" style="margin-right:10px; color:#0d6efd;"></i>
                    <strong>CORS settings</strong> - To allow requests from your WordPress domain
                </li>
            </ul>
            
            <div style="background:#fff3cd; padding:15px; border-radius:8px; margin:20px 0; display:flex; align-items:flex-start;">
                <div style="font-size:1.5rem; color:#856404; margin-right:15px;">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <div>
                    <strong>Important:</strong> For production use, make sure to deploy both the React app and the server to a secure hosting environment.
                </div>
            </div>
        </div>
        
        <div class="card" style="max-width:900px; padding:25px; margin-top:20px; border-radius:8px; box-shadow:0 0.5rem 1rem rgba(0,0,0,0.08);">
            <h2 style="margin-top:0; display:flex; align-items:center;">
                <i class="bi bi-question-circle" style="margin-right:10px; color:#0d6efd;"></i>
                Need Help?
            </h2>
            <p>If you need assistance with the Smart Form Builder plugin, please contact our support team.</p>
            <p>Default admin credentials for the form builder:</p>
            <ul style="list-style-type:none; padding-left:10px;">
                <li style="margin-bottom:10px; display:flex; align-items:center;">
                    <i class="bi bi-envelope" style="margin-right:10px; color:#0d6efd;"></i>
                    <strong>Email:</strong> admin@example.com
                </li>
                <li style="margin-bottom:10px; display:flex; align-items:center;">
                    <i class="bi bi-lock" style="margin-right:10px; color:#0d6efd;"></i>
                    <strong>Password:</strong> admin123
                </li>
            </ul>
        </div>
    </div>
    <?php
}
