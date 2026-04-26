#include <algorithm>
#include <cctype>
#include <iostream>
#include <map>
#include <sstream>
#include <string>

using namespace std;

int main() {
    map<string, int> freq;
    string line;

    while (getline(cin, line)) {
        if (line == "exit") {
            break;
        }

        for (char &ch : line) {
            if (isalpha(static_cast<unsigned char>(ch))) {
                ch = static_cast<char>(tolower(static_cast<unsigned char>(ch)));
            } else {
                // Replace punctuation and other separators with spaces for tokenization.
                ch = ' ';
            }
        }

        stringstream ss(line);
        string word;
        while (ss >> word) {
            ++freq[word];
        }
    }

    for (const auto &entry : freq) {
        cout << entry.first << ' ' << entry.second << '\n';
    }

    return 0;
}
